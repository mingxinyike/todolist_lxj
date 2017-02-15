var f = function() {
    var $ = NEJ.P('nej.$');
    var _e = NEJ.P('nej.e');
    var util = {
        // 工具,生成uuid码
        uuid: function () {
            /*jshint bitwise:false */
            var i, random;
            var uuid = '';

            for (i = 0; i < 32; i++) {
                random = Math.random() * 16 | 0;
                if (i === 8 || i === 12 || i === 16 || i === 20) {
                    uuid += '-';
                }
                uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
            }
            return uuid;
        },
        //存储在 localstorage 中
        store: function (namespace, data) {
            // 参数大于1 存
            if (arguments.length > 1) {
                return localStorage.setItem(namespace, JSON.stringify(data));
            } else {
                // 参数小于等于1 取
                var store = localStorage.getItem(namespace);
                return (store && JSON.parse(store)) || [];
            }
        },
        pluralize: function (num, word) {
            if (num > 1) {
                return word + 's';
            } else {
                return word;
            }
        }
    };
    
    var data = {

    }

    var app = {};
    app.init = function() {
        this.todos = util.store('todolist') || [];
        this.filter = "all";
        this._todokey = _e._$addHtmlTemplate('todo-template');
        // // var _data = { todos: this.todos};
        // var _tododata = {todos: this.todos};
        // _e._$renderHtmlTemplate('todo-list', this._todokey, _tododata);

        this._footerkey = _e._$addHtmlTemplate('footer-template');
        // var _footerdata = {activeTodoCount:2, activeTodoWord:"items", filter: "all", completedTodos: 1};
        // _e._$renderHtmlTemplate('footer', this._footerkey, _footerdata);
        this.render();
        this.bindEvents();
        new Router({
            '/:filter': function (filter) {
                this.filter = filter;
                this.render();
            }.bind(this)
        }).init('/all');

    };
    // 刷新
    app.render = function() {
        var todos = this._getFilterTodos(this.filter);
        var _tododata = {todos: todos};
        _e._$renderHtmlTemplate('todo-list', this._todokey, _tododata);
        util.store('todolist', this.todos);
        // renderfooter
        var todosNum = this._getFilterTodos().length;
        var activeNum = this._getActiveTodos().length;
        var _footerdata = {activeTodoCount: activeNum, activeTodoWord:util.pluralize(activeNum, 'item'), filter: this.filter, completedTodos: todosNum - activeNum};
        _e._$renderHtmlTemplate('footer', this._footerkey, _footerdata);

    };
    // 注册事件
    app.bindEvents = function() {
        $('#toggle-all')._$on('change', this._toggleAll.bind(this));
        $('#new-todo')._$on('keyup', this._create.bind(this));
        $('#todo-list')
            ._$on('click', this._destory.bind(this))
            ._$on('dblclick', this._edit.bind(this))
            ._$on('keyup', this._editKeyup.bind(this))
            ._$on('focusout', this._update.bind(this))
            ._$on('change', this._toggle.bind(this));
        $('#filters')._$on('click', this._filter.bind(this));
        $('#footer')._$on('click', this._clearCompleted.bind(this));
    };

    // 事件回调函数
    app._toggleAll = function() {
        // 只要有未完成的，全部变成完成；如果全部完成，则全部变成未完成
        if(app._getActiveTodos().length > 0) {
            this.todos.forEach(function(todo) {
                todo.completed = true;
            })
        } else {
            this.todos.forEach(function(todo) {
                todo.completed = false;
            })
        }
        this.render();
    };
    app._create = function(e) {
        // 判断按下回车键，并且内容不为空，则增加todo
        if(e.which == "13") {
            var val = $('#new-todo')._$val().trim();
            if (val !== "") {
                this.todos.push({
                    id: util.uuid(),
                    title: val,
                    completed: false
                });
                var newObj = {
                    id: util.uuid(),
                    title: val,
                    completed: false
                };

            }
            this.render();
            $('#new-todo')._$val("");
        }
    };
    app._destory = function(ev) {
        // 当前条目删除, 数据删除,render
        if (ev.target.tagName==="BUTTON") {
            this.todos.splice(this._getIndexFromElem(ev.target), 1);
            this.render();
        }
    };
    app._edit = function(ev) {
        // li add class editing
        $(ev.target)._$parent("li")._$attr("class", "editing");
    };
    app._editKeyup = function(ev) {
        // 回车 _update 
        // esc _update
        if (ev.which == "13") {
            ev.target.blur();
        }
        
    };
    app._update = function(ev) {
        // 有数据 则改数据后重新渲染 没数据 则删除数据后重新渲染
        if (ev.target.className === "edit") {
            if ( ev.target.value != "") {
                this.todos[this._getIndexFromElem(ev.target)].title = ev.target.value;
            }
            this.render(); 
        }
        
    };
    app._toggle = function(ev) {
        // 修改一个todo的状态, render
        if(ev.target.className === "toggle") {
            this.todos[this._getIndexFromElem(ev.target)].completed = !this.todos[this._getIndexFromElem(ev.target)].completed;
            this.render();
        }
        
    };

    app._filter = function(ev) {
        // 修改filter值，render
        // this.filter = ev.target.innerHTML;
        // this.render();
    };
    app._clearCompleted = function(ev) {
        // 删除所有 completed 的 todos, render
        if(ev.target.id === "clear-completed") {
            this.todos = this._getActiveTodos();
            this.render();
        }  
    }

    // 数据处理
    app._getFilterTodos = function(filter) {
        switch(filter) {
            case "all":
                return this.todos;
                break;
            case "active":
                return this._getActiveTodos();
                break;
            case "completed":
                return this._getCompletedTodos();
                break;
            default:
                return this.todos;
                break;
        }
    };
    app._getActiveTodos = function() {
        return this.todos.filter(function(todo){
            return !todo.completed;
        });
    };
    app._getCompletedTodos = function() {
        return this.todos.filter(function(todo){
            return todo.completed;
        });
    };
    // app._getOneTodo = function(item) {
    //     for(var i = 0; i < this.todos.length; i++) {
    //         if(this.todos[i].title == item) {
    //             return i;
    //         }
    //     }
    // };
    app._getIndexFromElem = function(el) {
        var id = $(el)._$parent("li")._$attr('data-id');
        var todos = this.todos;
        var i = todos.length;

        while (i--) {
            if (todos[i].id === id) {
                return i;
            }
        }
    }

    app.init();
};
NEJ.define(['{lib}util/template/tpl.js', '{lib}util/chain/chainable.js'], f);
