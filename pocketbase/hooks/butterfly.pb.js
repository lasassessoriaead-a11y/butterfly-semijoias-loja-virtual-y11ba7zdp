routerAdd('GET', '/backend/v1/butterfly/v1/shipping/quote', (e) => {
  const digits = String(e.request.url.query().get('cep') || '').replace(/\D/g, '')
  if (digits.length !== 8) throw new BadRequestError('Informe um CEP válido com 8 dígitos.')
  const cep = Number(digits)
  const ranges = e.app.findRecordsByFilter('shipping_ranges', 'active = true', 'start_cep', 100, 0)
  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i]
    if (cep >= range.getInt('start_cep') && cep <= range.getInt('end_cep')) {
      return e.json(200, {
        id: range.id,
        name: range.getString('name'),
        priceCents: range.getInt('price_cents'),
        estimatedDaysMin: range.getInt('estimated_days_min'),
        estimatedDaysMax: range.getInt('estimated_days_max'),
        provisional: true,
        notice:
          'Valor provisório sujeito à confirmação antes do envio. Nenhuma cotação de transportadora foi realizada.',
      })
    }
  }
  throw new BadRequestError(
    'CEP fora das faixas provisórias configuradas. Fale com a Butterfly para confirmar a entrega.',
  )
})

routerAdd('GET', '/backend/v1/butterfly/v1/public-config', (e) => {
  let baseUrl = $os.getenv('BUTTERFLY_GESTAO_URL') || ''
  let checkoutUrl = $os.getenv('BUTTERFLY_GESTAO_CHECKOUT_URL') || ''

  try {
    const records = e.app.findRecordsByFilter(
      'store_settings',
      "key = 'butterfly_gestao_integration'",
      '',
      1,
      0,
    )
    if (records.length) {
      const parsed = JSON.parse(records[0].getString('value')) || {}
      if (!baseUrl && parsed.baseUrl) baseUrl = String(parsed.baseUrl).trim()
      if (!checkoutUrl && parsed.checkoutUrl) checkoutUrl = String(parsed.checkoutUrl).trim()
    }
  } catch (_) {}

  baseUrl = baseUrl.replace(/\/+$/, '')
  if (!checkoutUrl && baseUrl) {
    checkoutUrl = baseUrl + '/checkout'
  }

  return e.json(200, {
    publicationEnabled: false,
    storeStatus: 'pre_launch',
    payments: { provider: 'butterfly_gestao', mode: 'redirect', realChargesEnabled: false },
    shipping: { provider: 'butterfly_gestao', realCarrierQuote: false },
    inventory: {
      primarySource: 'butterfly_gestao',
      connected: Boolean(baseUrl),
      currentData: 'live_gestao',
    },
    gestao: {
      configured: Boolean(baseUrl),
      checkoutUrl: checkoutUrl || '',
    },
  })
})

routerAdd('GET', '/backend/v1/butterfly/v1/gestao/shop', (e) => {
  let baseUrl = $os.getenv('BUTTERFLY_GESTAO_URL') || ''
  let token = $os.getenv('BUTTERFLY_GESTAO_TOKEN') || ''
  let checkoutUrl = $os.getenv('BUTTERFLY_GESTAO_CHECKOUT_URL') || ''

  try {
    const records = e.app.findRecordsByFilter(
      'store_settings',
      "key = 'butterfly_gestao_integration'",
      '',
      1,
      0,
    )
    if (records.length) {
      const parsed = JSON.parse(records[0].getString('value')) || {}
      if (!baseUrl && parsed.baseUrl) baseUrl = String(parsed.baseUrl).trim()
      if (!token && parsed.token) token = String(parsed.token).trim()
      if (!checkoutUrl && parsed.checkoutUrl) checkoutUrl = String(parsed.checkoutUrl).trim()
    }
  } catch (_) {}

  baseUrl = baseUrl.replace(/\/+$/, '')
  if (!checkoutUrl && baseUrl) {
    checkoutUrl = baseUrl + '/checkout'
  }
  const gestao = { baseUrl: baseUrl, token: token, checkoutUrl: checkoutUrl }
  if (!gestao.baseUrl) {
    return e.json(503, {
      configured: false,
      error: 'INTEGRATION_UNCONFIGURED',
      message:
        'A integração com o Butterfly Gestão aguarda a configuração da URL e do token de acesso.',
    })
  }

  const endpoint = gestao.baseUrl + '/api/shop'
  const headers = { Accept: 'application/json' }
  if (gestao.token) {
    headers['Authorization'] = 'Bearer ' + gestao.token
    headers['X-Gestao-Token'] = gestao.token
  }

  try {
    const res = $http.send({
      url: endpoint,
      method: 'GET',
      headers: headers,
      timeout: 12,
    })

    if (res.statusCode < 200 || res.statusCode >= 300) {
      return e.json(502, {
        configured: true,
        error: 'GESTAO_API_ERROR',
        status: res.statusCode,
        message:
          'O Butterfly Gestão respondeu com status ' +
          res.statusCode +
          '. Catálogo indisponível no momento.',
      })
    }

    let payload = res.json
    if (!payload && res.rawText) {
      try {
        payload = JSON.parse(res.rawText)
      } catch (_) {
        payload = null
      }
    }

    let rawProducts = []
    let metadata = {}
    if (Array.isArray(payload)) {
      rawProducts = payload
    } else if (payload && typeof payload === 'object') {
      if (Array.isArray(payload.products)) rawProducts = payload.products
      else if (Array.isArray(payload.data)) rawProducts = payload.data
      else if (Array.isArray(payload.items)) rawProducts = payload.items
      metadata = payload.metadata || payload.meta || {}
    }

    const normalized = rawProducts.map((p, index) => {
      const id = String(p.id || p.sku || 'gestao-' + index)
      const sku = String(p.sku || id)
      const name = String(p.name || p.title || 'Semijoia Butterfly')
      const slug = String(
        p.slug ||
          sku
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') ||
          'item-' + id,
      )
      let priceCents = 0
      if (typeof p.priceCents === 'number') priceCents = p.priceCents
      else if (typeof p.price_cents === 'number') priceCents = p.price_cents
      else if (typeof p.price === 'number') priceCents = Math.round(p.price * 100)
      else if (typeof p.valorCents === 'number') priceCents = p.valorCents
      else if (typeof p.valor === 'number') priceCents = Math.round(p.valor * 100)

      let comparePriceCents = 0
      if (typeof p.comparePriceCents === 'number') comparePriceCents = p.comparePriceCents
      else if (typeof p.compare_price_cents === 'number') comparePriceCents = p.compare_price_cents
      else if (typeof p.comparePrice === 'number')
        comparePriceCents = Math.round(p.comparePrice * 100)

      let category = String(p.category || 'outras').toLowerCase()
      const allowedCategories = ['brincos', 'colares', 'pulseiras', 'aneis', 'conjuntos', 'outras']
      if (allowedCategories.indexOf(category) === -1) {
        if (category.indexOf('brinco') !== -1 || category.indexOf('argola') !== -1)
          category = 'brincos'
        else if (
          category.indexOf('colar') !== -1 ||
          category.indexOf('gargantilha') !== -1 ||
          category.indexOf('choker') !== -1
        )
          category = 'colares'
        else if (category.indexOf('pulseira') !== -1 || category.indexOf('bracelete') !== -1)
          category = 'pulseiras'
        else if (category.indexOf('anel') !== -1 || category.indexOf('aneis') !== -1)
          category = 'aneis'
        else if (category.indexOf('conjunto') !== -1) category = 'conjuntos'
        else category = 'outras'
      }

      let variations = ['Dourado']
      if (Array.isArray(p.variations) && p.variations.length) {
        variations = p.variations.map(function (v) {
          return typeof v === 'string' ? v : v.name || v.label || v.title || 'Padrão'
        })
      } else if (category === 'aneis') {
        variations = ['Aro 14', 'Aro 16', 'Aro 18', 'Aro 20']
      }

      const imageUrl = String(
        p.imageUrl || p.image_url || p.image || (Array.isArray(p.images) && p.images[0]) || '',
      )
      const stock = typeof p.stock === 'number' ? p.stock : p.stockQuantity || p.quantity || 0
      const available = typeof p.available === 'boolean' ? p.available : stock > 0

      return {
        id: id,
        sku: sku,
        external_id: String(p.externalId || p.external_id || id),
        slug: slug,
        name: name,
        description: String(p.description || p.detalhes || ''),
        category: category,
        price_cents: Math.max(0, priceCents),
        compare_price_cents: Math.max(0, comparePriceCents),
        variations: variations,
        image_url: imageUrl,
        image_alt: String(p.imageAlt || p.image_alt || name),
        image_is_provisional: false,
        stock: Math.max(0, stock),
        available: available,
        featured: Boolean(p.featured || p.destaque),
        is_new: Boolean(p.isNew || p.is_new || p.lancamento),
        best_seller: Boolean(p.bestSeller || p.best_seller || p.maisVendido),
        source: 'butterfly_gestao',
        checkoutUrl: gestao.checkoutUrl
          ? gestao.checkoutUrl +
            '?sku=' +
            encodeURIComponent(sku) +
            '&productId=' +
            encodeURIComponent(id) +
            '&source=skip'
          : '',
      }
    })

    return e.json(200, {
      configured: true,
      source: 'butterfly_gestao',
      products: normalized,
      count: normalized.length,
      checkoutBaseUrl: gestao.checkoutUrl,
      metadata: metadata,
    })
  } catch (err) {
    return e.json(502, {
      configured: true,
      error: 'GESTAO_NETWORK_ERROR',
      message:
        'Não foi possível conectar ao Butterfly Gestão (' +
        String(err) +
        '). O catálogo ao vivo está temporariamente indisponível.',
    })
  }
})

routerAdd('POST', '/backend/v1/butterfly/v1/reseller-applications', (e) => {
  const body = e.requestInfo().body
  const name = String(body.name || '').trim()
  const city = String(body.city || '').trim()
  const phone = String(body.phone || '').trim()
  const whatsapp = String(body.whatsapp || '').trim()
  const email = String(body.email || '')
    .trim()
    .toLowerCase()
  const phoneDigits = phone.replace(/\D/g, '')
  const whatsappDigits = whatsapp.replace(/\D/g, '')
  if (
    name.length < 3 ||
    city.length < 2 ||
    phoneDigits.length < 10 ||
    whatsappDigits.length < 10 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    throw new BadRequestError('Revise os dados do formulário antes de enviar.')
  }

  const record = new Record(e.app.findCollectionByNameOrId('reseller_applications'))
  record.set('name', name)
  record.set('city', city)
  record.set('phone', phone)
  record.set('whatsapp', whatsapp)
  record.set('email', email)
  record.set('status', 'new')
  record.set('external_sync_status', 'pending')
  e.app.save(record)
  return e.json(201, {
    id: record.id,
    status: 'new',
    message: 'Candidatura recebida para análise.',
  })
})

routerAdd(
  'POST',
  '/backend/v1/butterfly/v1/checkout/orders',
  (e) => {
    const body = e.requestInfo().body
    const requestId = String(body.clientRequestId || '').trim()
    if (!/^[A-Za-z0-9_-]{12,100}$/.test(requestId))
      throw new BadRequestError('Identificador de checkout inválido.')

    const existing = e.app.findRecordsByFilter(
      'orders',
      "client_request_id = '" + requestId + "'",
      '',
      1,
      0,
    )
    if (existing.length) {
      if (existing[0].getString('customer') !== e.auth.id)
        throw new ForbiddenError('Identificador de checkout já utilizado.')
      const record = existing[0]
      return e.json(200, {
        order: {
          id: record.id,
          orderNumber: record.getString('order_number'),
          status: record.getString('status'),
          paymentStatus: record.getString('payment_status'),
          totalCents: record.getInt('total_cents'),
          shippingCents: record.getInt('shipping_cents'),
          shippingLabel: record.getString('shipping_label'),
          shippingProvisional: record.getBool('shipping_provisional'),
          pixMode: record.getString('pix_mode'),
          pixCorrelationId: record.getString('pix_correlation_id'),
          pixCopyPaste: record.getString('pix_copy_paste'),
          webhookConfirmed: record.getBool('webhook_confirmed'),
          created: record.getString('created'),
        },
        duplicatePrevented: true,
      })
    }

    if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 50)
      throw new BadRequestError('O carrinho está vazio ou inválido.')
    const address = body.address || {}
    const requiredAddress = [
      'recipient',
      'postalCode',
      'street',
      'number',
      'neighborhood',
      'city',
      'state',
    ]
    for (let a = 0; a < requiredAddress.length; a++)
      if (!String(address[requiredAddress[a]] || '').trim())
        throw new BadRequestError('Preencha o endereço completo para continuar.')
    if (String(address.state || '').trim().length !== 2)
      throw new BadRequestError('Informe a UF com 2 letras.')

    const postalDigits = String(address.postalCode || '').replace(/\D/g, '')
    if (postalDigits.length !== 8) throw new BadRequestError('Informe um CEP válido com 8 dígitos.')
    const cep = Number(postalDigits)
    const ranges = e.app.findRecordsByFilter(
      'shipping_ranges',
      'active = true',
      'start_cep',
      100,
      0,
    )
    let quote = null
    for (let r = 0; r < ranges.length; r++) {
      if (cep >= ranges[r].getInt('start_cep') && cep <= ranges[r].getInt('end_cep')) {
        quote = { name: ranges[r].getString('name'), priceCents: ranges[r].getInt('price_cents') }
        break
      }
    }
    if (!quote)
      throw new BadRequestError(
        'CEP fora das faixas provisórias configuradas. Fale com a Butterfly para confirmar a entrega.',
      )

    const normalizedItems = []
    let subtotal = 0
    for (let i = 0; i < body.items.length; i++) {
      const input = body.items[i]
      const quantity = Math.floor(Number(input.quantity || 0))
      if (quantity < 1 || quantity > 20)
        throw new BadRequestError('Quantidade inválida no carrinho.')
      let product
      try {
        product = e.app.findRecordById('products', String(input.productId || ''))
      } catch (_) {
        throw new BadRequestError('Um produto do carrinho não está mais disponível.')
      }
      if (!product.getBool('available') || product.getInt('stock') < quantity)
        throw new BadRequestError(
          'Estoque provisório insuficiente para ' + product.getString('name') + '.',
        )
      const price = product.getInt('price_cents')
      subtotal += price * quantity
      normalizedItems.push({
        productId: product.id,
        sku: product.getString('sku'),
        name: product.getString('name'),
        imageUrl: product.getString('image_url'),
        variation: String(input.variation || 'Dourado').slice(0, 80),
        quantity: quantity,
        unitPriceCents: price,
        source: product.getString('source'),
      })
    }

    const total = subtotal + quote.priceCents
    const orderNumber =
      'BF-' + new Date().getFullYear() + '-' + $security.randomString(7).toUpperCase()
    const correlationId = 'bf_' + $security.randomString(28)
    const pixCopyPaste = 'BUTTERFLY.PIX.TESTE|' + correlationId + '|' + total
    const record = new Record(e.app.findCollectionByNameOrId('orders'))
    record.set('order_number', orderNumber)
    record.set('client_request_id', requestId)
    record.set('customer', e.auth.id)
    record.set('items', JSON.stringify(normalizedItems))
    record.set(
      'shipping_address',
      JSON.stringify({
        recipient: String(address.recipient).trim(),
        postalCode: postalDigits,
        street: String(address.street).trim(),
        number: String(address.number).trim(),
        complement: String(address.complement || '').trim(),
        neighborhood: String(address.neighborhood).trim(),
        city: String(address.city).trim(),
        state: String(address.state).trim().toUpperCase(),
      }),
    )
    record.set('subtotal_cents', subtotal)
    record.set('shipping_cents', quote.priceCents)
    record.set('total_cents', total)
    record.set('shipping_label', quote.name + ' — valor provisório sujeito à confirmação')
    record.set('shipping_provisional', true)
    record.set('status', 'awaiting_payment')
    record.set('payment_status', 'awaiting')
    record.set('payment_method', 'pix')
    record.set('pix_mode', 'test_placeholder')
    record.set('pix_correlation_id', correlationId)
    record.set('pix_copy_paste', pixCopyPaste)
    record.set('webhook_confirmed', false)
    record.set('external_sync_status', 'pending')
    e.app.save(record)

    return e.json(201, {
      order: {
        id: record.id,
        orderNumber: orderNumber,
        status: 'awaiting_payment',
        paymentStatus: 'awaiting',
        totalCents: total,
        shippingCents: quote.priceCents,
        shippingLabel: quote.name + ' — valor provisório sujeito à confirmação',
        shippingProvisional: true,
        pixMode: 'test_placeholder',
        pixCorrelationId: correlationId,
        pixCopyPaste: pixCopyPaste,
        webhookConfirmed: false,
        created: record.getString('created'),
      },
      duplicatePrevented: false,
      testNotice:
        'Simulação Pix: nenhuma cobrança real foi criada. O pagamento só poderá ser confirmado por webhook Woovi validado.',
    })
  },
  $apis.requireAuth('users'),
)

routerAdd('POST', '/backend/v1/butterfly/v1/webhooks/woovi', (e) => {
  const secret = $os.getenv('WOOVI_WEBHOOK_SECRET')
  if (!secret)
    throw new ApiError(503, 'Webhook Woovi não configurado; nenhum pagamento foi alterado.')
  const raw = toString(e.request.body)
  const signature = e.request.header.get('x-openpix-signature')

  const utf8Bytes = (text) => {
    const bytes = []
    for (let i = 0; i < text.length; i++) {
      let code = text.charCodeAt(i)
      if (code < 128) bytes.push(code)
      else if (code < 2048) bytes.push(192 | (code >> 6), 128 | (code & 63))
      else if (code >= 55296 && code <= 56319 && i + 1 < text.length) {
        const next = text.charCodeAt(++i)
        code = 65536 + ((code - 55296) << 10) + (next - 56320)
        bytes.push(
          240 | (code >> 18),
          128 | ((code >> 12) & 63),
          128 | ((code >> 6) & 63),
          128 | (code & 63),
        )
      } else bytes.push(224 | (code >> 12), 128 | ((code >> 6) & 63), 128 | (code & 63))
    }
    return bytes
  }
  const sha1 = (input) => {
    const bytes = input.slice(),
      bitLength = bytes.length * 8
    bytes.push(128)
    while (bytes.length % 64 !== 56) bytes.push(0)
    for (let i = 7; i >= 0; i--) bytes.push(i < 4 ? (bitLength >>> (i * 8)) & 255 : 0)
    let h0 = 0x67452301,
      h1 = 0xefcdab89,
      h2 = 0x98badcfe,
      h3 = 0x10325476,
      h4 = 0xc3d2e1f0
    const w = new Array(80)
    for (let offset = 0; offset < bytes.length; offset += 64) {
      for (let i = 0; i < 16; i++)
        w[i] =
          (bytes[offset + i * 4] << 24) |
          (bytes[offset + i * 4 + 1] << 16) |
          (bytes[offset + i * 4 + 2] << 8) |
          bytes[offset + i * 4 + 3] |
          0
      for (let i = 16; i < 80; i++) {
        const value = w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16]
        w[i] = (value << 1) | (value >>> 31)
      }
      let a = h0,
        b = h1,
        c = h2,
        d = h3,
        f = h4
      for (let i = 0; i < 80; i++) {
        let fn, k
        if (i < 20) {
          fn = (b & c) | (~b & d)
          k = 0x5a827999
        } else if (i < 40) {
          fn = b ^ c ^ d
          k = 0x6ed9eba1
        } else if (i < 60) {
          fn = (b & c) | (b & d) | (c & d)
          k = 0x8f1bbcdc
        } else {
          fn = b ^ c ^ d
          k = 0xca62c1d6
        }
        const temp = (((a << 5) | (a >>> 27)) + fn + f + k + w[i]) | 0
        f = d
        d = c
        c = (b << 30) | (b >>> 2)
        b = a
        a = temp
      }
      h0 = (h0 + a) | 0
      h1 = (h1 + b) | 0
      h2 = (h2 + c) | 0
      h3 = (h3 + d) | 0
      h4 = (h4 + f) | 0
    }
    const output = [],
      words = [h0, h1, h2, h3, h4]
    for (let i = 0; i < words.length; i++)
      for (let shift = 24; shift >= 0; shift -= 8) output.push((words[i] >>> shift) & 255)
    return output
  }
  let keyBytes = utf8Bytes(secret)
  if (keyBytes.length > 64) keyBytes = sha1(keyBytes)
  while (keyBytes.length < 64) keyBytes.push(0)
  const inner = [],
    outer = []
  for (let i = 0; i < 64; i++) {
    inner.push(keyBytes[i] ^ 0x36)
    outer.push(keyBytes[i] ^ 0x5c)
  }
  const digest = sha1(outer.concat(sha1(inner.concat(utf8Bytes(raw)))))
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  let expected = ''
  for (let i = 0; i < digest.length; i += 3) {
    const a = digest[i],
      b = i + 1 < digest.length ? digest[i + 1] : 0,
      c = i + 2 < digest.length ? digest[i + 2] : 0,
      value = (a << 16) | (b << 8) | c
    expected +=
      chars[(value >> 18) & 63] +
      chars[(value >> 12) & 63] +
      (i + 1 < digest.length ? chars[(value >> 6) & 63] : '=') +
      (i + 2 < digest.length ? chars[value & 63] : '=')
  }
  let valid = Boolean(signature) && expected.length === signature.length,
    mismatch = 0
  if (valid)
    for (let i = 0; i < expected.length; i++)
      mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i)
  valid = valid && mismatch === 0
  if (!valid) throw new ForbiddenError('Assinatura Woovi inválida.')

  let payload
  try {
    payload = JSON.parse(raw)
  } catch (_) {
    throw new BadRequestError('Payload inválido.')
  }
  if (payload.event !== 'OPENPIX:CHARGE_COMPLETED')
    throw new BadRequestError('Evento Woovi não suportado.')
  const charge = payload.charge || (payload.pix && payload.pix.charge) || {}
  const correlationId = String(charge.correlationID || payload.correlationID || '')
  if (!/^[A-Za-z0-9_-]{10,120}$/.test(correlationId))
    throw new BadRequestError('CorrelationID inválido.')
  if (String(charge.status || '').toUpperCase() !== 'COMPLETED')
    throw new BadRequestError('A cobrança ainda não está concluída.')
  const orders = e.app.findRecordsByFilter(
    'orders',
    "pix_correlation_id = '" + correlationId + "'",
    '',
    1,
    0,
  )
  if (!orders.length)
    throw new NotFoundError('Pedido não encontrado para o correlationID recebido.')
  const order = orders[0]
  const receivedValue = Number(charge.value || (payload.pix && payload.pix.value) || 0)
  if (!Number.isFinite(receivedValue) || receivedValue !== order.getInt('total_cents'))
    throw new BadRequestError('Valor do webhook não corresponde ao pedido.')

  const transactionId = String(
    charge.transactionID || (payload.pix && payload.pix.transactionID) || 'sem-transacao',
  )
  const idempotencyKey = correlationId + ':' + payload.event + ':' + transactionId
  const processed = e.app.findRecordsByFilter(
    'webhook_events',
    "idempotency_key = '" + idempotencyKey.replace(/'/g, '') + "'",
    '',
    1,
    0,
  )
  if (processed.length) return e.json(200, { received: true, duplicate: true })

  order.set('payment_status', 'paid')
  order.set('status', 'paid')
  order.set('webhook_confirmed', true)
  order.set('paid_at', new Date().toISOString())
  order.set('woovi_charge_id', transactionId.slice(0, 160))
  e.app.save(order)
  const event = new Record(e.app.findCollectionByNameOrId('webhook_events'))
  event.set('provider', 'woovi')
  event.set('event_type', payload.event)
  event.set('idempotency_key', idempotencyKey.slice(0, 240))
  event.set('correlation_id', correlationId)
  event.set('signature_valid', true)
  event.set('payload_hash', $security.sha256(raw))
  e.app.save(event)
  return e.json(200, { received: true, paid: true, orderId: order.id })
})

routerAdd(
  'GET',
  '/backend/v1/butterfly/v1/integration/products',
  (e) => {
    if (!e.auth || e.auth.getString('role') !== 'admin')
      throw new ForbiddenError('Acesso restrito à administração.')
    const records = e.app.findRecordsByFilter('products', '', 'sku', 500, 0)
    return e.json(200, {
      data: records.map((r) => ({
        id: r.id,
        externalId: r.getString('external_id'),
        sku: r.getString('sku'),
        name: r.getString('name'),
        priceCents: r.getInt('price_cents'),
        stock: r.getInt('stock'),
        source: r.getString('source'),
        updated: r.getString('updated'),
      })),
      sourcePriority: 'butterfly_gestao',
      integrationActive: false,
    })
  },
  $apis.requireAuth('users'),
)

routerAdd(
  'GET',
  '/backend/v1/butterfly/v1/integration/orders',
  (e) => {
    if (!e.auth || e.auth.getString('role') !== 'admin')
      throw new ForbiddenError('Acesso restrito à administração.')
    const records = e.app.findRecordsByFilter('orders', '', '-created', 500, 0)
    return e.json(200, {
      data: records.map((r) => ({
        id: r.id,
        orderNumber: r.getString('order_number'),
        customerId: r.getString('customer'),
        status: r.getString('status'),
        paymentStatus: r.getString('payment_status'),
        totalCents: r.getInt('total_cents'),
        syncStatus: r.getString('external_sync_status'),
        created: r.getString('created'),
      })),
    })
  },
  $apis.requireAuth('users'),
)

routerAdd(
  'GET',
  '/backend/v1/butterfly/v1/integration/reseller-applications',
  (e) => {
    if (!e.auth || e.auth.getString('role') !== 'admin')
      throw new ForbiddenError('Acesso restrito à administração.')
    const records = e.app.findRecordsByFilter('reseller_applications', '', '-created', 500, 0)
    return e.json(200, {
      data: records.map((r) => ({
        id: r.id,
        name: r.getString('name'),
        city: r.getString('city'),
        phone: r.getString('phone'),
        whatsapp: r.getString('whatsapp'),
        email: r.getString('email'),
        status: r.getString('status'),
        syncStatus: r.getString('external_sync_status'),
        created: r.getString('created'),
      })),
    })
  },
  $apis.requireAuth('users'),
)

routerAdd(
  'POST',
  '/backend/v1/butterfly/v1/integration/inventory',
  (e) => {
    if (!e.auth || e.auth.getString('role') !== 'admin')
      throw new ForbiddenError('Acesso restrito à administração.')
    const body = e.requestInfo().body
    if (!Array.isArray(body.products) || body.products.length > 500)
      throw new BadRequestError('Lista de produtos inválida.')
    let updated = 0
    for (let i = 0; i < body.products.length; i++) {
      const item = body.products[i],
        sku = String(item.sku || '').replace(/'/g, '')
      if (
        !sku ||
        !Number.isInteger(Number(item.stock)) ||
        !Number.isInteger(Number(item.priceCents))
      )
        continue
      const records = e.app.findRecordsByFilter('products', "sku = '" + sku + "'", '', 1, 0)
      if (!records.length) continue
      const product = records[0]
      product.set('external_id', String(item.externalId || '').slice(0, 120))
      product.set('stock', Math.max(0, Number(item.stock)))
      product.set('price_cents', Math.max(0, Number(item.priceCents)))
      product.set('available', Number(item.stock) > 0)
      product.set('source', 'butterfly_gestao')
      e.app.save(product)
      updated++
    }
    return e.json(200, { updated: updated, source: 'butterfly_gestao' })
  },
  $apis.requireAuth('users'),
)
