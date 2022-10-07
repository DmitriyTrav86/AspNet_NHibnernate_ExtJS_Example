//Models

Ext.define('Catalog.model.Customer', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'code', type: 'string' },
        { name: 'address', type: 'string' },
        { name: 'discount', type: 'number' }
    ]
});

Ext.define('Catalog.model.Position', {
    extend: 'Ext.data.Model',
    viewModel: {
        type: 'PositionViewModel'
    },
    fields: [
        { name: 'id', type: 'string' },
        { name: 'itemPrice', type: 'number' },
        { name: 'itemsCount', type: 'number' },
        {
            name: 'itemId',
            type: 'string',
            reference: 'Catalog.model.Item'
        },
        {
            name: 'orderId',
            type: 'string',
            reference: 'Catalog.model.Order'
        },
        {
            name: 'priceTest',
            type: 'number',
            bind: '{price}'
        }
    ]
});

Ext.define('Catalog.model.Item', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'code', type: 'string' },
        { name: 'price', type: 'number' },
        { name: 'category', type: 'string' }
    ],
    validations: [{
        type: 'length',
        field: 'name',
        min: 2
    }]
});

Ext.define('Catalog.model.Order', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'id', type: 'string' },
        {
            name: 'customerId',
            type: 'string',
            reference: 'Catalog.model.Customer'
        },
        {
            name: 'orderDate',
            type: 'date'
        },
        {
            name: 'shipmentDate',
            type: 'date'
        },
        {
            name: 'orderNumber',
            type: 'number'
        },
        {
            name: 'status',
            type: 'string'
        }
    ]
});

// stores
Ext.define('Catalog.store.Items', {
    extend: 'Ext.data.Store',
    model: 'Catalog.model.Item',
    fields: ['id', 'name', 'price', 'category', 'code'],
    proxy: {
        type: 'ajax',
        url: 'Catalog/GetItems'
    },
    autoLoad: true
});
Ext.define('Catalog.store.Orders', {
    extend: 'Ext.data.Store',
    model: 'Catalog.model.Order',
    fields: ['id', { name: 'orderDate', type: 'date' }, { name: 'shipmentDate', type: 'date'}, 'customer', 'status', 'orderNumber'],
    proxy: {
        type: 'ajax',
        url: 'Orders/GetOrders'
    },
    autoLoad: true
});

Ext.define('Catalog.store.Positions', {
    extend: 'Ext.data.Store',
    model: 'Catalog.model.Position',
    fields: ['id', 'itemPrice', 'itemsCount', 'item', 'order'],
    data : []
});

var positionsStore = Ext.create('Catalog.store.Positions');

/// viewModel
Ext.define('Catalog.view.pageViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.pageVM',
    data: {
        customer: new Catalog.model.Customer(),
        order: {},
        items: []
    },
    stores: {
        //items: store,
        positions: positionsStore
    },
    formulas: {
        cartCount: {
            bind: {
                bindTo: '{positions}',
                deep: true
            },
            get: function (storage) {
                return storage.data.items.length && storage.data.items.map(item => item.get('itemsCount')).reduce((prev, next) => prev + next);
            }
        },
        userName: {
            bind: '{customer}',
            get: function (c) {
                if (isManager) return "Admin";
                return c.get('name');
            }
        },
        totalPrice: {
            bind: {
                bindTo: '{positions}', 
                deep: true
            },
            get: function (storage) {
                var total = storage.data.items.length && storage.data.items.map(item => item.get('item').get('price') * item.get('itemsCount')).reduce((prev, next) => prev + next);
                return total;
            }
        },
        discount: {
            bind: '{customer}',
            get: function (c) {
                return c.get('discount');
            }
        },
        grandTotal: {
            bind: {
                bindTo: '{positions}',
                deep: true
            },
            get: function (storage) {
                var total = storage.data.items.length && storage.data.items.map(item => item.get('item').get('price') * item.get('itemsCount')).reduce((prev, next) => prev + next);
                var discount = this.get('discount');
                return total * (100 - discount) / 100;
            }
        }
    }
});
var customerViewModel = new Catalog.view.pageViewModel();

// some logic
if (isAuthenticated && !isManager) {
    Ext.Ajax.request({
        url: 'Catalog/GetCurrentCustomer',
        method: 'GET',
        success: function (resp) {
            if (resp.responseText) {
                var obj = Ext.decode(resp.responseText);
                customerViewModel.set('customer', new Catalog.model.Customer(obj));
            }
        },
        failure: function (resp) {
            console.log(resp);
        }
    });
}
Ext.application({
    name: 'Site',
    launch: function () {
        Ext.create('Ext.Component', {
            viewModel: customerViewModel,
            cls: 'right-nav-item inline-block',
            bind: {
                html: 'Welcome back, {userName}!',
                hidden: '{!userName}'
            },
            renderTo: 'rightMenuItem'
        });
    }
});