migrate(
  (app) => {
    const settings = app.findCollectionByNameOrId('store_settings')
    const key = 'butterfly_gestao_integration'
    const existing = app.findRecordsByFilter('store_settings', "key = '" + key + "'", '', 1, 0)
    if (existing.length) return

    const record = new Record(settings)
    record.set('key', key)
    record.set(
      'value',
      JSON.stringify({
        baseUrl: '',
        token: '',
        checkoutUrl: '',
        description:
          'Configuração da integração com Butterfly Gestão (GET /api/shop e checkout source=skip).',
      }),
    )
    record.set(
      'description',
      'Configuração da API Butterfly Gestão (base URL, token e checkout URL). Segredos também podem ser passados por variáveis de ambiente BUTTERFLY_GESTAO_URL e BUTTERFLY_GESTAO_TOKEN.',
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
      if (records.length) app.delete(records[0])
    } catch (_) {}
  },
)
