//设置当前日期
var dateSpan = document.querySelector(".date");
var date = new Date();
dateSpan.innerHTML = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

//存取localStorage中的数据
var store = {
    save: function (key, value) {
        window.localStorage.setItem(key, JSON.stringify(value));
    },
    fetch: function (key) {
        return JSON.parse(window.localStorage.getItem(key)) || [];
    }
};

// store.save('todoData', '')

var todoList = store.fetch('todoData') || [];

var app = new Vue({
    el: '#app',
    data: {
        showNewTodoDiv: true,
        showAddTaskDiv: false,
        todoList, //储存用户添加的todo
        displayTodoList: [],  //展示在html中的todo
        newTodo: {},
        selectType: 'unfinished',
        editTodo: {},
        before: ''  //存储编辑todo前的内容
    },
    methods: {
        //添加任务
        addTodo: function () {
            if(!this.newTodo.content) return;
            this.todoList.unshift({
                content: this.newTodo.content,
                finished: false
            });
            this.newTodo = {};
            this.switchNewTodoDivAndAddTodoDiv();
        },
        //取消添加任务
        cancelNewTodo: function () {
            this.newTodo = {};
            this.switchNewTodoDivAndAddTodoDiv();
        },
        //删除任务
        deleteTodo: function() {
            for (let i = 0; i < this.todoList.length; i++) {
                if (this.todoList[i].id === this.editTodo.id) {
                    this.todoList.splice(i, 1);
                    break;
                }
            }
            this.closeEditDiv();
        },
        //取消编辑任务
        cancelEditTodo: function() {
            this.editTodo.content = this.before;
            this.closeEditDiv();
        },
        //在新建任务界面和添加任务界面切换
        switchNewTodoDivAndAddTodoDiv: function () {
            this.showNewTodoDiv = !this.showNewTodoDiv;
            this.showAddTaskDiv = !this.showAddTaskDiv;
        },
        closeEditDiv: function() {
            this.$refs.taskDetail.style.width = 0 + 'px';//关闭编辑div
            this.$refs.mainTask.style.width = '100%';
        },
        //点击圆圈调用完成todo方法
        finishedTodo: function (todo, e) {
            if (todo.finished) return; //如果点击的todo已经是完成的 不进行任何操作
            e.target.src = "images/finished.png";
            e.target.alt = "已完成";
            
            //给点击的todo加一个滑出屏幕的动画
            e.target.parentNode.style.left = window.innerWidth + 'px';
            setTimeout(() => {
                //等动画完成后再改变状态
                todoList.forEach(function (item, index) {
                    if (item.id === todo.id) {
                        todoList[index].finished = true;
                    }
                });

                //如果当前的条件是全部 则画出屏幕后再滑回来
                if (app.selectType === 'all') {
                    e.target.parentNode.style.left = 0;
                } else {
                    var parent = e.target.parentNode.parentNode;
                    parent.removeChild(e.target.parentNode);
                }
            },800)
        },
        //在每次渲染的template时候设置todo的状态图片
        setStateImg: function (isFinished) {
            var imgSrc = '';
            if(isFinished) {
                imgSrc = "images/finished.png"
            } else {
                imgSrc = "images/unfinished.png"
            }
            return imgSrc;
        },
        //编辑todo
        editingTodo: function (currentTodo) {
            //显示编辑todo的div
            document.querySelector(".task-detail-wrap").style.width = 500 + 'px';
            var mainTask = app.$refs.mainTask;
            mainTask.style.width = window.innerWidth - 500 + 'px';
            var editInput = document.querySelector(".edit-input");
            editInput.value = currentTodo.content;
            app.before = currentTodo.content; //存储点击时todo的内容
            editInput.focus();
            app.editTodo = currentTodo;  // 将当前编辑的todo信息赋给app.editTodo
        }
    },
    watch: {
        todoList:{
            handler: function(){
                store.save("todoData",this.todoList);
            },
            deep: true //深度监听
        }
    },
    computed: {
        //根据用户选择的条件返回数据
        filterData: function () {
            var filter = {
                all: function (todoList) {
                    return todoList;
                },
                unfinished: function (todoList) {
                    return todoList.filter((todo) => !todo.finished)
                },
                finished: function (todoList) {
                    return todoList.filter((todo) => todo.finished)
                }
            };

            return filter[this.selectType] ? filter[this.selectType](this.todoList) : this.todoList;
        }
    }
});

//点击新建任务时让input获取焦点
var buildTodo = document.querySelector(".new-todo-div");
buildTodo.addEventListener('click', function (e) {
    if (e.target.id === 'add-task' || e.target.id === 'add-btn') {
        setTimeout(() => document.querySelector("#addTask").focus())
    }
});


