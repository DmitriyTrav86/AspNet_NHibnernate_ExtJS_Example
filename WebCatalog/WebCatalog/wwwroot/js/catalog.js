

var store = Ext.create('Catalog.store.Items', {
    model: "Catalog.model.Item"
});

Ext.define('Catalog.view.ItemsList', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.Itemslist',
    title: 'Catalog goods',
    store: store,
    initComponent: function () {
        if (isManager) {
            this.tbar = [{
                text: 'Add Item',
                action: 'add',
                iconCls: 'item-add background-cover'
            }];
        }
        this.columns = [
            { header: 'name', dataIndex: 'name', flex: 1 },
            { header: 'Price', dataIndex: 'price', width: 120 },
            { header: 'category', dataIndex: 'category', width: 120 },
            { header: 'code', dataIndex: 'code', width: 120 }];
        this.columns.push({
            header: 'Action', width: 80, renderer: function (v, m, r) {
                var id = Ext.id();
                Ext.defer(function () {
                    if (isManager) {
                        //delete button
                        Ext.widget('image', {
                            renderTo: id,
                            name: 'delete',
                            src: 'images/Item_delete.png',
                            cls: 'pointer',
                            listeners: {
                                afterrender: function (me) {
                                    me.getEl().on('click', function () {
                                        var grid = Ext.ComponentQuery.query('Itemslist')[0];
                                        if (grid) {
                                            Ext.defer(function () {
                                                var sm = grid.getSelectionModel();
                                                var rs = sm.getSelection();
                                                if (!rs.length) {
                                                    Ext.Msg.alert('Info', 'No Item Selected');
                                                    return;
                                                }
                                                Ext.Msg.confirm('Remove Item',
                                                    'Are you sure you want to delete?',
                                                    function (button) {
                                                        if (button == 'yes') {
                                                            Ext.Ajax.request({
                                                                url: 'Catalog/RemoveItem',
                                                                method: 'POST',
                                                                params: { itemJson: Ext.encode(rs[0].data) },
                                                                success: function (result, request) {
                                                                    grid.store.remove(rs[0]);
                                                                },
                                                                failure: function (result, request) {
                                                                    Ext.MessageBox.alert('Failed', result.responseText);
                                                                }
                                                            });
                                                        }
                                                    });
                                            }, 50);
                                        }
                                        return true;
                                    });
                                }
                            }
                        });
                    } else {
                        Ext.widget('image', {
                            renderTo: id,
                            style: 'width: 46px; height: 40px;',
                            name: 'buy',
                            src: 'images/cart.png',
                            cls: 'pointer background-cover',
                            listeners: {
                                afterrender: function (me) {
                                    me.getEl().on('click', function () {
                                        var grid = Ext.ComponentQuery.query('Itemslist')[0];
                                        if (grid) {
                                            Ext.defer(function () {
                                                var sm = grid.getSelectionModel();
                                                var rs = sm.getSelection();
                                                var position = positionsStore.findRecord('itemId', rs[0].id);
                                                if (position) {
                                                    var count = position.get('itemsCount');
                                                    position.set('itemsCount', count + 1);
                                                } else {
                                                    position = new Catalog.model.Position({ itemsCount: 1, itemId: rs[0].id, item: rs[0] });
                                                    positionsStore.add(position);
                                                }
                                            }, 50);
                                        }
                                        return true;
                                    });
                                }
                            }
                        });
                    }
                }, 50);
                return Ext.String.format('<div id="{0}"></div>', id);
            }
        });
        
        this.callParent(arguments);
    }
});
Ext.define('Catalog.view.ItemsForm', {
    extend: 'Ext.window.Window',
    alias: 'widget.Itemsform',
    title: 'Add Item',
    width: 350,
    layout: 'fit',
    resizable: false,
    closeAction: 'hide',
    modal: true,
    modelValidation: true,
    config: {
        recordIndex: 0,
        action: ''
    },
    items: [{
        xtype: 'form',
        layout: 'anchor',
        bodyStyle: {
            background: 'none',
            padding: '10px',
            border: '0'
        },
        defaults: {
            xtype: 'textfield',
            anchor: '100%'
        },
        items: [{
            name: 'name',
            fieldLabel: 'Name'
        },
            {
                name: 'price',
                fieldLabel: 'Price',
                allowBlank: false,
                validator: function (value) {
                    if (isNaN(value))
                        return 'Value must be a number';
                    if (parseFloat(value) < 0)
                        return 'Value can\'t be negative';
                    return true;
                }
            },
            {
                name: 'category',
                fieldLabel: 'Category'
            },
            {
                name: 'code',
                fieldLabel: 'Code',
                allowBlank: false,
                validator: function (value) {
                    if (value.length == 12 && (/([0-9]{2})-([0-9]{4})-([A-Z]{2}[0-9]{2})/gm).test(value)) {
                        return true;
                    } else {
                        return 'Value must correspond to format: 00-0000-AA00';
                    }
                }
            }]
    }],
    buttons: [{
        text: 'OK',
        action: 'add'
    }, {
        text: 'Reset',
        handler: function () {
            this.up('window').down('form').getForm().reset();
        }
    }, {
        text: 'Cancel',
        handler: function () {
            this.up('window').close();
        }
    }]
});
Ext.define('Catalog.controller.Items', {
    extend: 'Ext.app.Controller',
    stores: ['Items'],
    views: ['ItemsList', 'ItemsForm'],
    refs: [{
        ref: 'formWindow',
        xtype: 'Itemsform',
        selector: 'Itemsform',
        autoCreate: true
    }],
    init: function () {
        myController = this;
        this.control({
            'Itemslist > toolbar > button[action=add]': {
                click: this.showAddForm
            },
            'Itemslist': {
                itemdblclick: this.onRowdblclick
            },
            'Itemsform button[action=add]': {
                click: this.doAddItem
            }
        });
    },
    onRowdblclick: function (me, record, item, index) {
        if (!isManager) return;
        var win = this.getFormWindow();
        win.setTitle('Edit Item');
        win.setAction('edit');
        win.setRecordIndex(index);
        win.down('form').getForm().setValues(record.getData());
        win.show();
    },
    showAddForm: function () {
        var win = this.getFormWindow();
        win.setTitle('Add Item');
        win.setAction('add');
        win.down('form').getForm().reset();
        win.show();
    },
    doAddItem: function () {
        var win = this.getFormWindow();
        var form = win.down('form');
        var values = form.getValues();
        var action = win.action;
        var item = Ext.create('Catalog.model.Item', values);
        if (!form.isValid()) {
            Ext.MessageBox.alert('Failed', 'Please, fill all fields correctly');
            return;
        }
        if (action == 'edit') {
            var id = store.getAt(win.getRecordIndex()).data.id;
            item.data.id = id;
            Ext.Ajax.request({
                url: 'Catalog/UpdateItem',
                method: 'POST',
                params: { itemJson: Ext.encode(item.data) },
                //jsonData: writer.getRecordData(item),
                success: function (result, request) {
                    store.removeAt(win.getRecordIndex());
                    store.insert(win.getRecordIndex(), item);
                    win.close();
                },
                failure: function (result) {
                    Ext.MessageBox.alert('Failed', result.responseText);
                }
            });
        }
        else {
            item.data.id = null;
            Ext.Ajax.request({
                url: 'Catalog/CreateItem',
                method: 'POST',
                params: { itemJson: Ext.encode(item.data) },
                success: function (result) {
                    item.set("id", result.responseText);
                    store.add(item);
                    win.close();
                },
                failure: function (result) {
                    Ext.MessageBox.alert('Failed', result.responseText);
                }
            });
        }
    }
});


////// Basket logic//
Ext.define('Catalog.view.PositionsList', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.Positionslist',
    store: positionsStore,
    initComponent: function () {
        this.columns = [
            { header: 'Item name', flex: 1, renderer: function (v, m, r) { return '<span>' + r.get('item').get('name') + '</span>'; }},
            { header: 'Count', renderer: function (v, m, r) { return '<span>' + r.get('itemsCount') + '</span>'; }, width: 80 },
            { header: 'Price', width: 80, renderer: function (v, m, r) { return '<span>' + r.get('item').get('price') * r.get('itemsCount'); + '</span>'} }];
        this.columns.push({
            header: 'Action', width: 60, renderer: function (v, m, r) {
                var id = Ext.id();
                Ext.defer(function () {
                    
                        Ext.widget('image', {
                            renderTo: id,
                            name: 'delete',
                            src: 'images/Item_delete.png',
                            cls: 'pointer',
                            listeners: {
                                afterrender: function (me) {
                                    me.getEl().on('click', function () {
                                        var grid = Ext.ComponentQuery.query('Positionslist')[0];
                                        if (grid) {
                                            Ext.defer(function () {
                                                var sm = grid.getSelectionModel();
                                                var rs = sm.getSelection();
                                                positionsStore.remove(rs[0]);
                                                if (!positionsStore.data.length)
                                                    cartForm.close();
                                            }, 50);
                                        }
                                        return true;
                                    });
                                }
                            }
                        });
                }, 50);
                return Ext.String.format('<div id="{0}"></div>', id);
            }
        });

        this.callParent(arguments);
    }
});

Ext.define('Catalog.view.CartForm', {
    extend: 'Ext.window.Window',
    alias: 'widget.Cartform',
    title: 'Cart',
    width: 350,
    resizable: true,
    closeAction: 'hide',
    modal: true,
    config: {
        recordIndex: 0,
        action: ''
    },
    items: [Ext.widget('Positionslist', { }),
        Ext.create('Ext.Component', {
            viewModel: customerViewModel,
            cls: 'grand-total',
            bind: {
                html: '<p>Total price:{totalPrice}<br>Discount: {discount}%</p><h4>Your price: {grandTotal}</h4>'
            },
            width: 'Auto'
        })],
    buttons: [{
        text: 'Checkout',
        handler: function () {
            Ext.Msg.confirm('Confirmation order',
            'Are you sure you want checkout?',
            function (button) {
                if (button == 'yes') {

                    var arr = customerViewModel.get('positions').getData().items.map(function (x) {
                        return {
                            item: { id: x.get('itemId') }, itemsCount: x.get('itemsCount')
                        };
                    });

                    Ext.Ajax.request({
                        url: 'Catalog/Checkout',
                        method: 'POST',
                        params: { positionsJson: Ext.encode(arr) },
                        success: function (result, request) {
                            window.location.assign("orders");
                            cartForm.close();
                        },
                        failure: function (result, request) {
                            Ext.MessageBox.alert('Failed', result.responseText);
                        }
                    });
                }
            });
        }
    },{
        text: 'Cancel',
        handler: function () {
            this.up('window').close();
        }
    }]
});

var cartForm = new Catalog.view.CartForm();

////// Basket logic end//

Ext.application({
    name: 'Catalog',
    controllers: ['Items'],
    launch: function () {
        Ext.widget('Itemslist', {
            width: 'Auto',
            height: 400,
            renderTo: 'output'
        });
        Ext.create('Ext.Component', {
            viewModel: customerViewModel,
            cls: 'right-nav-item inline-block pointer',
            bind: {
                html: '<a>Your Cart has {cartCount} items</a>',
                hidden: '{!cartCount}'
            },
            renderTo: 'rightMenuItem',
            listeners: {
                afterrender: function (me) {
                    me.getEl().on('click', function () {
                        cartForm.show();
                        console.log('cart');
                    });
                }
            }
        });
    }
});