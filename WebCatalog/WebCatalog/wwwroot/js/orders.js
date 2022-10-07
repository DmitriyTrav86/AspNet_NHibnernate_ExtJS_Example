var orderStore = Ext.create('Catalog.store.Orders', {
    listeners: {
        load: function (a,e) {
            //a.setData(e.sort((a, b) => b.get('orderNumber') - a.get('orderNumber')));
        }
    }
});

Ext.define('Catalog.view.OrdersList', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.Orderslist',
    title: 'Orders',
    store: orderStore,
    initComponent: function () {
        this.columns = [
            { header: 'Number', dataIndex: 'orderNumber', width: 80 },
            { header: 'Order date', dataIndex: 'orderDate', width: 120, renderer: function (v, m, r) { 
                    console.log('d', v);
                    if (!v || v.getFullYear() < 1900)
                        return '<span></span>';
                    return v.toLocaleDateString();
                }
            },
            { header: 'Shipment date', dataIndex: 'shipmentDate', width: 120, renderer: function (v, m, r) {
                    console.log('d', v);
                    if (!v || v.getFullYear() < 1900)
                        return '<span></span>';
                    return v.toLocaleDateString();
                }
            },
            { header: 'Status', dataIndex: 'status', width: 120 }];
        this.columns.push({
            header: 'Action', width: 80, renderer: function (v, m, r) {
                var id = Ext.id();
                Ext.defer(function () {
                    if (isManager) {
                        if (r.get('status') == 'New') {
                            Ext.widget('image', {
                                renderTo: id,
                                name: 'submit',
                                style: 'width: 20px; height: 20px;',
                                src: 'images/disclosure.png',
                                cls: 'pointer',
                                listeners: {
                                    afterrender: function (me) {
                                        me.getEl().on('click', function () {
                                            var grid = Ext.ComponentQuery.query('Orderslist')[0];
                                            if (grid) {
                                                Ext.Ajax.request({
                                                    url: 'Orders/SubmitOrder',
                                                    method: 'POST',
                                                    params: { orderId: r.data.id },
                                                    success: function (result, request) {
                                                        //grid.store.remove(r);
                                                        var obj = JSON.parse(result.responseText);
                                                        var order = Ext.create('Catalog.model.Order', obj);
                                                        var index = orderStore.data.items.indexOf(r);
                                                        orderStore.removeAt(index);
                                                        orderStore.insert(index, order);
                                                    },
                                                    failure: function (result, request) {
                                                        Ext.MessageBox.alert('Failed', result.responseText);
                                                    }
                                                });
                                            }
                                            return true;
                                        });
                                    }
                                }
                            });
                        } else if (r.get('status') == 'In Progress'){
                            Ext.widget('image', {
                                renderTo: id,
                                name: 'submit',
                                style: 'width: 20px; height: 20px;',
                                src: 'images/check_dark.png',
                                cls: 'pointer',
                                listeners: {
                                    afterrender: function (me) {
                                        me.getEl().on('click', function () {
                                            var grid = Ext.ComponentQuery.query('Orderslist')[0];
                                            if (grid) {
                                                Ext.Ajax.request({
                                                    url: 'Orders/FinishOrder',
                                                    method: 'POST',
                                                    params: { orderId: r.data.id },
                                                    success: function (result, request) {
                                                        //grid.store.remove(r);
                                                        var obj = JSON.parse(result.responseText);
                                                        var order = Ext.create('Catalog.model.Order', obj);
                                                        var index = orderStore.data.items.indexOf(r);
                                                        orderStore.removeAt(index);
                                                        orderStore.insert(index, order);
                                                    },
                                                    failure: function (result, request) {
                                                        Ext.MessageBox.alert('Failed', result.responseText);
                                                    }
                                                });
                                            }
                                            return true;
                                        });
                                    }
                                }
                            });
                        }
                    } else {
                        //cancel button
                        if (r.get('status') == 'New') { 
                            Ext.widget('image', {
                                renderTo: id,
                                name: 'delete',
                                src: 'images/Item_delete.png',
                                cls: 'pointer',
                                listeners: {
                                    afterrender: function (me) {
                                        me.getEl().on('click', function () {
                                            var grid = Ext.ComponentQuery.query('Orderslist')[0];
                                            if (grid) {
                                                Ext.Msg.confirm('Cancel Order',
                                                    'Are you sure you want to cancel?',
                                                    function (button) {
                                                        if (button == 'yes') {
                                                            console.log('yes');
                                                            Ext.Ajax.request({
                                                                url: 'Orders/CancelOrder',
                                                                method: 'POST',
                                                                params: { orderId: r.data.id },
                                                                success: function (result, request) {
                                                                    grid.store.remove(r);
                                                                },
                                                                failure: function (result, request) {
                                                                    Ext.MessageBox.alert('Failed', result.responseText);
                                                                }
                                                            });
                                                        }
                                                    });
                                            }
                                            return true;
                                        });
                                    }
                                }
                            });
                        }
                    }
                }, 50);
                return Ext.String.format('<div id="{0}"></div>', id);
            }
        });

        this.callParent(arguments);
    }
});


Ext.application({
    name: 'Catalog',
    launch: function () {
        Ext.widget('Orderslist', {
            width: 522,
            layout: 'fit',
            renderTo: 'output'
        });
    }
});