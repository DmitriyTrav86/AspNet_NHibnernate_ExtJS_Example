

Ext.define('UserManagement.model.Customer', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'code', type: 'string' },
        { name: 'address', type: 'string' },
        { name: 'discount', type: 'number' }
    ]
});

Ext.define('UserManagement.model.User', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'id', type: 'string' },
        { name: 'username', type: 'string' },
        { name: 'password', type: 'string' },
        { name: 'role', type: 'string' },
        {
            name: 'customerId',
            type: 'string',
            reference: 'UserManagement.model.Customer',
            unique: true
        }
    ]
});
Ext.define('UserManagement.store.Users', {
    extend: 'Ext.data.Store',
    model: 'UserManagement.model.User',
    fields: ['id', 'username', 'password', 'role']
});

var store = Ext.create('UserManagement.store.Users', {
    autoLoad: true,
    model: "UserManagement.model.User",
    proxy: {
        type: 'ajax',
        url: 'Security/GetUsers'
    }
});
store.load();

Ext.define('UserManagement.model.User', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'id', type: 'string' },
        { name: 'username', type: 'string' },
        { name: 'password', type: 'string' },
        { name: 'role', type: 'string' },
        {
            name: 'customerId',
            type: 'string',
            reference: 'UserManagement.model.Customer',
            unique: true
        }
    ]
});

Ext.define('UserManagement.view.UsersList', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.Userslist',
    title: 'Users',
    store: store,
    initComponent: function () {
        if (isManager) {
            this.tbar = [{
                text: 'Add User',
                action: 'add',
                iconCls: 'item-add background-cover'
            }];
        }
        this.columns = [
            { header: 'username', dataIndex: 'username', width: 120 },
            { header: 'password', dataIndex: 'password', width: 120 },
            { header: 'role', dataIndex: 'role', width: 100 }];
        if (isManager) {
            this.columns.push({
                header: 'Action', width: 80, renderer: function (v, m, r) {
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
                                        var grid = Ext.ComponentQuery.query('Userslist')[0];
                                        if (grid) {
                                            Ext.defer(function () {
                                                var sm = grid.getSelectionModel();
                                                var rs = sm.getSelection();
                                                if (!rs.length) {
                                                    Ext.Msg.alert('Info', 'No Item Selected');
                                                    return;
                                                }
                                                Ext.Msg.confirm('Remove User',
                                                    'Are you sure you want to delete?',
                                                    function (button) {
                                                        if (button == 'yes') {
                                                            Ext.Ajax.request({
                                                                url: 'Security/RemoveUser',
                                                                method: 'POST',
                                                                params: { userJson: Ext.encode(rs[0].data) },
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
                    }, 50);
                    return Ext.String.format('<div id="{0}"></div>', id);
                }
            });
        }
        this.callParent(arguments);
    }
});

Ext.define('UserManagement.view.UsersForm', {
    extend: 'Ext.window.Window',
    alias: 'widget.Usersform',
    title: 'Add User',
    width: 350,
    layout: { type: 'vbox', align: 'stretch' },
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
            padding: '10px 10px 0 10px',
            border: '0'
        },
        defaults: {
            xtype: 'textfield',
            anchor: '100%'
        },
        items: [{
            name: 'username',
            fieldLabel: 'Username',
            allowBlank: false
        },
        {
            name: 'password',
            fieldLabel: 'Password',
            allowBlank: false
        },
        {
            name: 'role',
            id: 'roleCombo',
            xtype: 'combo',
            fieldLabel: 'Role',
            hiddenName: 'role',
            store: new Ext.data.SimpleStore({
                data: [
                    ['Manager', 'Manager'],
                    ['Customer', 'Customer']
                ],
                id: 0,
                fields: ['value', 'text']
            }),
            valueField: 'value',
            displayField: 'text',
            triggerAction: 'all',
            editable: false,
            value: 'Manager'
        }]
    },
    {
        xtype: 'form',
        id: 'CustomerForm',
        layout: 'anchor',
        hidden: true,
        bodyStyle: {
            background: 'none',
            padding: '0 10px 0 10px',
            border: '0'
        },
        defaults: {
            xtype: 'textfield',
            anchor: '100%'
        },
        items: [{
            name: 'id',
            fieldLabel: 'id',
            hidden: true
        }, {
            name: 'name',
            fieldLabel: 'Name',
            allowBlank: false
        }, {
            name: 'code',
            fieldLabel: 'Code',
            allowBlank: false,
            id: 'codeInput',
            editable: false
        }, {
            name: 'address',
            fieldLabel: 'Address'
        },
        {
            name: 'discount',
            fieldLabel: 'Discount'
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
Ext.define('UserManagement.controller.Users', {
    extend: 'Ext.app.Controller',
    stores: ['Users'],
    views: ['UsersList', 'UsersForm'],
    refs: [{
        ref: 'formWindow',
        xtype: 'Usersform',
        selector: 'Usersform',
        autoCreate: true
    }],
    init: function () {
        myController = this;
        this.control({
            'Userslist > toolbar > button[action=add]': {
                click: this.showAddForm
            },
            'Userslist': {
                itemdblclick: this.onRowdblclick
            },
            'Usersform button[action=add]': {
                click: this.doAddItem
            },
            '#roleCombo': {
                change: function (a, val) {
                    var customerForm = Ext.ComponentQuery.query('#CustomerForm')[0];
                    if (val == 'Manager') {
                        customerForm.hide();
                    } else {
                        customerForm.show();
                    }
                }
            }
        });
    },
    onRowdblclick: function (me, record, item, index) {
        var win = this.getFormWindow();
        win.setTitle('Edit User');
        win.setAction('edit');
        win.setRecordIndex(index);
        win.down('form').getForm().setValues(record.getData());
        var customerForm = Ext.ComponentQuery.query('#CustomerForm')[0];
        customerForm.getForm().setValues(record.getData().customer);
        Ext.ComponentQuery.query('#roleCombo')[0].setReadOnly(true);
        win.show();
    },
    showAddForm: function () {
        var win = this.getFormWindow();
        win.setTitle('Add User');
        win.setAction('add');
        win.down('form').getForm().reset();

        Ext.ComponentQuery.query('#roleCombo')[0].setReadOnly(false);
        win.show();
        var customerForm = Ext.ComponentQuery.query('#CustomerForm')[0];
        customerForm.getForm().reset();
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0');
        var yyyy = today.getFullYear();
        var codeInput = Ext.ComponentQuery.query('#codeInput')[0];
        codeInput.setValue(dd + mm + '-' + yyyy);
    },
    doAddItem: function () {
        var win = this.getFormWindow();
        var form = win.down('form');
        if (!form.isValid()) {
            Ext.MessageBox.alert('Failed', 'Please, fill all fields correctly');
            return;
        }
        var values = form.getValues();
        var action = win.action;
        var user = Ext.create('UserManagement.model.User', values);
        if (user.data.role == 'Customer') {
            var customerForm = Ext.ComponentQuery.query('#CustomerForm')[0];
            if (customerForm.isValid()) {
                var values = customerForm.getValues();
                var customer = Ext.create('UserManagement.model.Customer', values);
                var customerData = customer.data;
                user.data.customer = customerData;
            } else {
                Ext.MessageBox.alert('Failed', 'Please, fill all fields correctly');
                return;
            }
        }
        if (action == 'edit') {
            var id = store.getAt(win.getRecordIndex()).data.id;
            user.data.id = id;
            Ext.Ajax.request({
                url: 'Security/UpdateUser',
                method: 'POST',
                params: { userJson: Ext.encode(user.data) },
                success: function (result, request) {
                    store.removeAt(win.getRecordIndex());
                    store.insert(win.getRecordIndex(), user);
                    win.close();
                },
                failure: function (result, request) {
                    Ext.MessageBox.alert('Failed', result.responseText);
                }
            });
        }
        else {
            user.data.id = null;
            if (user.data.customer) user.data.customer.id = null;
            Ext.Ajax.request({
                url: 'Security/CreateUser',
                method: 'POST',
                params: { userJson: Ext.encode(user.data)},
                success: function (result, request) {
                    var obj = Ext.decode(result.responseText);
                    user.set("id", obj.Id);
                    if (obj.Customer) {
                        user.data.customer.id = obj.Customer.Id;
                    }

                    store.add(user);
                    win.close();
                },
                failure: function (result, request) {
                    Ext.MessageBox.alert('Failed', result.responseText);
                }
            });
        }
    }
});
Ext.application({
    name: 'UserManagement',
    controllers: ['Users'],
    launch: function () {
        Ext.widget('Userslist', {
            width: 422,
            height: 400,
            renderTo: 'output'
        });
    }
});