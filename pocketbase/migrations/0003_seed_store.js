migrate(
  (app) => {
    const products = app.findCollectionByNameOrId('products')
    const seedProducts = [
      [
        'BF-BRI-001',
        'brinco-aurea',
        'Brinco Áurea',
        'Brinco de linhas orgânicas e acabamento dourado luminoso, pensado para composições elegantes do dia à noite.',
        'brincos',
        12990,
        12,
        true,
        true,
        true,
        'https://img.usecurling.com/p/900/1100?q=gold%20earrings&color=white',
        'Brinco dourado Áurea — foto provisória',
      ],
      [
        'BF-COL-001',
        'colar-luz-de-esmeralda',
        'Colar Luz de Esmeralda',
        'Colar delicado com ponto de cor verde-esmeralda e banho dourado, inspirado na leveza da borboleta.',
        'colares',
        18990,
        8,
        true,
        true,
        false,
        'https://img.usecurling.com/p/900/1100?q=emerald%20necklace&color=white',
        'Colar dourado com pedra verde — foto provisória',
      ],
      [
        'BF-PUL-001',
        'pulseira-essencia',
        'Pulseira Essência',
        'Pulseira de elos sutis com brilho equilibrado e fecho ajustável para acompanhar diferentes composições.',
        'pulseiras',
        14990,
        15,
        true,
        false,
        true,
        'https://img.usecurling.com/p/900/1100?q=gold%20bracelet&color=white',
        'Pulseira dourada Essência — foto provisória',
      ],
      [
        'BF-ANE-001',
        'anel-casulo',
        'Anel Casulo',
        'Anel de curvas envolventes com acabamento polido. Uma peça marcante, mantendo a delicadeza da coleção.',
        'aneis',
        11990,
        18,
        true,
        false,
        true,
        'https://img.usecurling.com/p/900/1100?q=gold%20ring&color=white',
        'Anel dourado Casulo — foto provisória',
      ],
      [
        'BF-CON-001',
        'conjunto-metamorfose',
        'Conjunto Metamorfose',
        'Conjunto de colar e brincos com desenho contemporâneo e acabamento dourado para ocasiões especiais.',
        'conjuntos',
        27990,
        6,
        true,
        true,
        false,
        'https://img.usecurling.com/p/900/1100?q=jewelry%20set&color=white',
        'Conjunto de semijoias douradas — foto provisória',
      ],
      [
        'BF-BRI-002',
        'argola-horizonte',
        'Argola Horizonte',
        'Argola leve de presença sofisticada, com superfície lisa e brilho dourado uniforme.',
        'brincos',
        9990,
        21,
        false,
        false,
        true,
        'https://img.usecurling.com/p/900/1100?q=gold%20hoops&color=white',
        'Argolas douradas Horizonte — foto provisória',
      ],
      [
        'BF-COL-002',
        'colar-borboleta-serena',
        'Colar Borboleta Serena',
        'Pingente delicado inspirado no símbolo Butterfly, em corrente fina de acabamento dourado.',
        'colares',
        16990,
        10,
        true,
        true,
        true,
        'https://img.usecurling.com/p/900/1100?q=butterfly%20pendant&color=white',
        'Colar com pingente de borboleta — foto provisória',
      ],
      [
        'BF-OUT-001',
        'broche-asas',
        'Broche Asas',
        'Broche de desenho leve para finalizar produções com um detalhe dourado inspirado em asas.',
        'outras',
        8990,
        9,
        false,
        true,
        false,
        'https://img.usecurling.com/p/900/1100?q=butterfly%20brooch&color=white',
        'Broche dourado em forma de borboleta — foto provisória',
      ],
    ]
    for (let i = 0; i < seedProducts.length; i++) {
      const item = seedProducts[i]
      if (app.findRecordsByFilter('products', "sku = '" + item[0] + "'", '', 1, 0).length) continue
      const record = new Record(products)
      record.set('sku', item[0])
      record.set('slug', item[1])
      record.set('name', item[2])
      record.set('description', item[3])
      record.set('category', item[4])
      record.set('price_cents', item[5])
      record.set('compare_price_cents', 0)
      record.set(
        'variations',
        JSON.stringify(
          item[4] === 'aneis' ? ['Aro 14', 'Aro 16', 'Aro 18', 'Aro 20'] : ['Dourado'],
        ),
      )
      record.set('image_url', item[10])
      record.set('image_alt', item[11])
      record.set('image_is_provisional', true)
      record.set('stock', item[6])
      record.set('available', true)
      record.set('featured', item[7])
      record.set('is_new', item[8])
      record.set('best_seller', item[9])
      record.set('source', 'provisional')
      app.save(record)
    }

    const shipping = app.findCollectionByNameOrId('shipping_ranges')
    const ranges = [
      ['Faixa provisória 1', 0, 19999999, 1490, 4, 8],
      ['Faixa provisória 2', 20000000, 39999999, 2190, 6, 11],
      ['Faixa provisória 3', 40000000, 65999999, 2790, 8, 14],
      ['Faixa provisória 4', 66000000, 99999999, 3190, 10, 18],
    ]
    for (let i = 0; i < ranges.length; i++) {
      const row = ranges[i]
      if (app.findRecordsByFilter('shipping_ranges', "name = '" + row[0] + "'", '', 1, 0).length)
        continue
      const record = new Record(shipping)
      record.set('name', row[0])
      record.set('start_cep', row[1])
      record.set('end_cep', row[2])
      record.set('price_cents', row[3])
      record.set('estimated_days_min', row[4])
      record.set('estimated_days_max', row[5])
      record.set('active', true)
      record.set('provisional', true)
      app.save(record)
    }

    const settings = app.findCollectionByNameOrId('store_settings')
    const seedSettings = [
      [
        'store_status',
        { publicationEnabled: false, message: 'Loja em pré-lançamento' },
        'Publicação definitiva permanece rigorosamente desativada.',
      ],
      [
        'payments',
        { provider: 'woovi', mode: 'test_placeholder', realChargesEnabled: false },
        'Cobranças reais bloqueadas no servidor.',
      ],
      [
        'shipping',
        {
          provider: 'provisional_table',
          notice: 'Valor provisório sujeito à confirmação antes do envio.',
        },
        'Preparado para futura troca por Correios ou transportadora.',
      ],
      [
        'inventory_source',
        { primary: 'butterfly_gestao', connected: false, currentData: 'provisional' },
        'Butterfly Gestão será a fonte principal quando a integração for ativada.',
      ],
      [
        'social_links',
        { whatsapp: '#', instagram: '#', facebook: '#', provisional: true },
        'Links provisórios até confirmação dos perfis oficiais.',
      ],
    ]
    for (let i = 0; i < seedSettings.length; i++) {
      const item = seedSettings[i]
      if (app.findRecordsByFilter('store_settings', "key = '" + item[0] + "'", '', 1, 0).length)
        continue
      const record = new Record(settings)
      record.set('key', item[0])
      record.set('value', JSON.stringify(item[1]))
      record.set('description', item[2])
      record.set('sensitive', false)
      app.save(record)
    }

    let admin
    try {
      admin = app.findAuthRecordByEmail('users', 'luka2510@hotmail.com')
    } catch (_) {
      admin = new Record(app.findCollectionByNameOrId('users'))
      admin.setEmail('luka2510@hotmail.com')
      admin.setPassword('Skip@Pass')
      admin.setVerified(true)
      admin.set('name', 'Administrador Butterfly')
    }
    admin.set('role', 'admin')
    app.save(admin)
  },
  (app) => {
    const collections = [
      'webhook_events',
      'store_settings',
      'shipping_ranges',
      'reseller_applications',
      'orders',
      'addresses',
      'products',
    ]
    for (let i = 0; i < collections.length; i++) {
      try {
        app.truncateCollection(app.findCollectionByNameOrId(collections[i]))
      } catch (_) {}
    }
    try {
      app.delete(app.findAuthRecordByEmail('users', 'luka2510@hotmail.com'))
    } catch (_) {}
  },
)
