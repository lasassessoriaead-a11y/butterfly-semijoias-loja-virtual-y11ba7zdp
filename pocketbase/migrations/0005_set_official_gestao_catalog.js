migrate(
  (app) => {
    const settings = app.findCollectionByNameOrId('store_settings')
    const key = 'butterfly_gestao_integration'
    const records = app.findRecordsByFilter('store_settings', "key = '" + key + "'", '', 1, 0)
    const officialBaseUrl = 'https://butterfly-semijoias-gestao.luka251083739205.chatgpt.site'
    const officialCheckoutUrl =
      'https://butterfly-semijoias-gestao.luka251083739205.chatgpt.site/checkout'

    if (records.length) {
      const record = records[0]
      record.set(
        'value',
        JSON.stringify({
          baseUrl: officialBaseUrl,
          token: '',
          checkoutUrl: officialCheckoutUrl,
          description:
            'Catálogo oficial Butterfly Gestão: endpoint público GET /api/shop sem exigência de token e checkout com source=skip.',
        }),
      )
      record.set(
        'description',
        'Configuração oficial do Butterfly Gestão. Endpoint público sem token; compras direcionadas com source=skip.',
      )
      record.set('sensitive', false)
      app.save(record)
      return
    }

    const record = new Record(settings)
    record.set('key', key)
    record.set(
      'value',
      JSON.stringify({
        baseUrl: officialBaseUrl,
        token: '',
        checkoutUrl: officialCheckoutUrl,
        description:
          'Catálogo oficial Butterfly Gestão: endpoint público GET /api/shop sem exigência de token e checkout com source=skip.',
      }),
    )
    record.set(
      'description',
      'Configuração oficial do Butterfly Gestão. Endpoint público sem token; compras direcionadas com source=skip.',
    )
    record.set('sensitive', false)
    app.save(record)
  },
  (app) => {
    try {
      const records = app.findRecordsByFilter(
        'store_settings',
        "key = 'butterfly_gestao_integration'",
        '',
        1,
        0,
      )
      if (records.length) {
        const record = records[0]
        record.set(
          'value',
          JSON.stringify({
            baseUrl: '',
            token: '',
            checkoutUrl: '',
            description: 'Configuração da integração com Butterfly Gestão.',
          }),
        )
        app.save(record)
      }
    } catch (_) {}
  },
)
