migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    if (!users.fields.getByName('role')) {
      users.fields.add(
        new SelectField({ name: 'role', values: ['customer', 'admin'], maxSelect: 1 }),
      )
    }
    if (!users.fields.getByName('phone')) {
      users.fields.add(new TextField({ name: 'phone', max: 30 }))
    }
    users.listRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    users.viewRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    users.createRule = "@request.body.role = '' || @request.body.role = 'customer'"
    users.updateRule =
      "id = @request.auth.id && (@request.body.role = '' || @request.body.role = @request.auth.role)"
    users.deleteRule = "id = @request.auth.id && @request.auth.role != 'admin'"
    app.save(users)

    const products = new Collection({
      name: 'products',
      type: 'base',
      listRule: "available = true || @request.auth.role = 'admin'",
      viewRule: "available = true || @request.auth.role = 'admin'",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'sku', type: 'text', required: true, max: 80 },
        { name: 'external_id', type: 'text', max: 120 },
        { name: 'slug', type: 'text', required: true, max: 140 },
        { name: 'name', type: 'text', required: true, max: 180 },
        { name: 'description', type: 'editor', maxSize: 10000 },
        {
          name: 'category',
          type: 'select',
          required: true,
          values: ['brincos', 'colares', 'pulseiras', 'aneis', 'conjuntos', 'outras'],
          maxSelect: 1,
        },
        { name: 'price_cents', type: 'number', required: false, min: 0, onlyInt: true },
        { name: 'compare_price_cents', type: 'number', min: 0, onlyInt: true },
        { name: 'variations', type: 'json', maxSize: 5000 },
        { name: 'image_url', type: 'url' },
        { name: 'image_alt', type: 'text', max: 220 },
        { name: 'image_is_provisional', type: 'bool' },
        { name: 'stock', type: 'number', min: 0, onlyInt: true },
        { name: 'available', type: 'bool' },
        { name: 'featured', type: 'bool' },
        { name: 'is_new', type: 'bool' },
        { name: 'best_seller', type: 'bool' },
        {
          name: 'source',
          type: 'select',
          required: true,
          values: ['provisional', 'butterfly_gestao'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_products_sku ON products (sku)',
        'CREATE UNIQUE INDEX idx_products_slug ON products (slug)',
        'CREATE INDEX idx_products_category_available ON products (category, available)',
        'CREATE INDEX idx_products_featured ON products (featured, is_new, best_seller)',
      ],
    })
    app.save(products)

    const addresses = new Collection({
      name: 'addresses',
      type: 'base',
      listRule: "@request.auth.id != '' && user = @request.auth.id",
      viewRule: "@request.auth.id != '' && user = @request.auth.id",
      createRule: "@request.auth.id != '' && @request.body.user = @request.auth.id",
      updateRule:
        "@request.auth.id != '' && user = @request.auth.id && (@request.body.user = '' || @request.body.user = @request.auth.id)",
      deleteRule: "@request.auth.id != '' && user = @request.auth.id",
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'label', type: 'text', required: true, max: 50 },
        { name: 'recipient', type: 'text', required: true, max: 140 },
        { name: 'postal_code', type: 'text', required: true, max: 9 },
        { name: 'street', type: 'text', required: true, max: 180 },
        { name: 'number', type: 'text', required: true, max: 30 },
        { name: 'complement', type: 'text', max: 100 },
        { name: 'neighborhood', type: 'text', required: true, max: 100 },
        { name: 'city', type: 'text', required: true, max: 100 },
        { name: 'state', type: 'text', required: true, min: 2, max: 2 },
        { name: 'is_default', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_addresses_user ON addresses (user)'],
    })
    app.save(addresses)

    const orders = new Collection({
      name: 'orders',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (customer = @request.auth.id || @request.auth.role = 'admin')",
      viewRule:
        "@request.auth.id != '' && (customer = @request.auth.id || @request.auth.role = 'admin')",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'order_number', type: 'text', required: true, max: 40 },
        { name: 'client_request_id', type: 'text', required: true, max: 100 },
        {
          name: 'customer',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'items', type: 'json', required: true, maxSize: 50000 },
        { name: 'shipping_address', type: 'json', required: true, maxSize: 10000 },
        { name: 'subtotal_cents', type: 'number', required: false, min: 0, onlyInt: true },
        { name: 'shipping_cents', type: 'number', required: false, min: 0, onlyInt: true },
        { name: 'total_cents', type: 'number', required: true, min: 1, onlyInt: true },
        { name: 'shipping_label', type: 'text', required: true, max: 180 },
        { name: 'shipping_provisional', type: 'bool' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: [
            'awaiting_payment',
            'paid',
            'preparing',
            'shipped',
            'delivered',
            'cancelled',
            'expired',
          ],
          maxSelect: 1,
        },
        {
          name: 'payment_status',
          type: 'select',
          required: true,
          values: ['awaiting', 'paid', 'expired', 'cancelled'],
          maxSelect: 1,
        },
        { name: 'payment_method', type: 'select', required: true, values: ['pix'], maxSelect: 1 },
        {
          name: 'pix_mode',
          type: 'select',
          required: true,
          values: ['test_placeholder', 'woovi_test', 'live'],
          maxSelect: 1,
        },
        { name: 'pix_correlation_id', type: 'text', required: true, max: 120 },
        { name: 'pix_copy_paste', type: 'text', required: true, max: 2000 },
        { name: 'woovi_charge_id', type: 'text', max: 160 },
        { name: 'webhook_confirmed', type: 'bool' },
        { name: 'paid_at', type: 'date' },
        {
          name: 'external_sync_status',
          type: 'select',
          values: ['pending', 'synced', 'error'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_orders_number ON orders (order_number)',
        'CREATE UNIQUE INDEX idx_orders_client_request ON orders (client_request_id)',
        'CREATE UNIQUE INDEX idx_orders_pix_correlation ON orders (pix_correlation_id)',
        'CREATE INDEX idx_orders_customer_created ON orders (customer, created DESC)',
        'CREATE INDEX idx_orders_status_created ON orders (status, created DESC)',
      ],
    })
    app.save(orders)

    const applications = new Collection({
      name: 'reseller_applications',
      type: 'base',
      listRule: "@request.auth.role = 'admin'",
      viewRule: "@request.auth.role = 'admin'",
      createRule: null,
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'name', type: 'text', required: true, max: 140 },
        { name: 'city', type: 'text', required: true, max: 120 },
        { name: 'phone', type: 'text', required: true, max: 30 },
        { name: 'whatsapp', type: 'text', required: true, max: 30 },
        { name: 'email', type: 'email', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['new', 'reviewing', 'contacted', 'approved', 'declined'],
          maxSelect: 1,
        },
        { name: 'notes', type: 'text', max: 2000 },
        {
          name: 'external_sync_status',
          type: 'select',
          values: ['pending', 'synced', 'error'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_reseller_status_created ON reseller_applications (status, created DESC)',
      ],
    })
    app.save(applications)

    const shipping = new Collection({
      name: 'shipping_ranges',
      type: 'base',
      listRule: "@request.auth.role = 'admin'",
      viewRule: "@request.auth.role = 'admin'",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'name', type: 'text', required: true, max: 120 },
        {
          name: 'start_cep',
          type: 'number',
          required: false,
          min: 0,
          max: 99999999,
          onlyInt: true,
        },
        { name: 'end_cep', type: 'number', required: false, min: 0, max: 99999999, onlyInt: true },
        { name: 'price_cents', type: 'number', required: false, min: 0, onlyInt: true },
        { name: 'estimated_days_min', type: 'number', min: 1, max: 90, onlyInt: true },
        { name: 'estimated_days_max', type: 'number', min: 1, max: 90, onlyInt: true },
        { name: 'active', type: 'bool' },
        { name: 'provisional', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_shipping_range ON shipping_ranges (active, start_cep, end_cep)'],
    })
    app.save(shipping)

    const settings = new Collection({
      name: 'store_settings',
      type: 'base',
      listRule: "@request.auth.role = 'admin'",
      viewRule: "@request.auth.role = 'admin'",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'key', type: 'text', required: true, max: 100 },
        { name: 'value', type: 'json', required: true, maxSize: 10000 },
        { name: 'description', type: 'text', max: 500 },
        { name: 'sensitive', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_store_settings_key ON store_settings (key)'],
    })
    app.save(settings)

    const webhookEvents = new Collection({
      name: 'webhook_events',
      type: 'base',
      listRule: "@request.auth.role = 'admin'",
      viewRule: "@request.auth.role = 'admin'",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'provider', type: 'select', required: true, values: ['woovi'], maxSelect: 1 },
        { name: 'event_type', type: 'text', required: true, max: 100 },
        { name: 'idempotency_key', type: 'text', required: true, max: 240 },
        { name: 'correlation_id', type: 'text', required: true, max: 120 },
        { name: 'signature_valid', type: 'bool' },
        { name: 'payload_hash', type: 'text', required: true, max: 128 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_webhook_idempotency ON webhook_events (idempotency_key)'],
    })
    app.save(webhookEvents)
  },
  (app) => {
    const names = [
      'webhook_events',
      'store_settings',
      'shipping_ranges',
      'reseller_applications',
      'orders',
      'addresses',
      'products',
    ]
    for (let i = 0; i < names.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(names[i]))
      } catch (_) {}
    }

    const users = app.findCollectionByNameOrId('users')
    if (users.fields.getByName('phone')) users.fields.removeByName('phone')
    if (users.fields.getByName('role')) users.fields.removeByName('role')
    users.listRule = 'id = @request.auth.id'
    users.viewRule = 'id = @request.auth.id'
    users.createRule = ''
    users.updateRule = 'id = @request.auth.id'
    users.deleteRule = 'id = @request.auth.id'
    app.save(users)
  },
)
