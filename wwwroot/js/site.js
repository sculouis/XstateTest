// 共用模組產生uuid
var commonMixin = {
    created: function () {
        this.myid = this.uuid()
    },
    methods: {
        //產生uuid
        uuid: function () {
            var seed = Date.now();
            if (window.performance && typeof window.performance.now === "function") {
                seed += performance.now();
            }

            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (seed + Math.random() * 16) % 16 | 0;
                seed = Math.floor(seed / 16);

                return (c === 'x' ? r : r & (0x3 | 0x8)).toString(16);
            });

            return uuid;
        }
    },
    computed: {
        isdisabled: function () {
            if (this.setDisabled == 'false') {
                return false;
            } else {
                return true;
            }
        }
    }
}


Vue.component('hotai-menu', {
    data: function () {
        return {
            menus: [{
                    uri: "/",
                    name: '元件說明'
                },
                {
                    uri: "/Quotation",
                    name: '新件報價'
                }
            ]
        }
    },
    template: '#menuTemplate'
})

Vue.component('main-panel', {
    props: ['titleName', 'mainPanelId'],
    template: '#mainPanelTemplate'
})

Vue.component('panel', {
    props: ['panelName', 'panelId'],
    template: '#panelTemplate'
})

// 文字輸入框 
Vue.component('input-text', {
    template: '#inputTextTemplate',
    props: ['titleName', 'value', 'placeholder'],
    data: function () {
        return {
            val: "",
        };
    },
    mounted: function () {
        this.val = this.value;
    },
    updated: function () {
        this.$emit('input', this.val); //reflect to parent dataModel
    }
})

// 文字輸入框(唯獨) 
Vue.component('input-text-disabled', {
    template: '#inputTextDisabledTemplate',
    props: ['titleName', 'value', 'placeholder'],
    data: function () {
        return {
            val: "",
        };
    },
    mounted: function () {
        this.val = this.value;
    }
})

Vue.component('input-text-icon', {
    props: ['titleName', 'value', 'iconName', 'buttonTitle', 'placeholder'],
    template: '#inputTextIconTemplate',
    data: function () {
        return {
            val: '',
            baseClass: 'fa',
            iconClass: ''
        }
    },
    mounted: function () {
        this.val = this.value
        this.iconClass = this.iconName
    },
    updated: function () {
        this.$emit('input', this.val); //reflect to parent dataModel
    },
})

Vue.component('input-group', {
    props: ['titleName'],
    template: '#inputGroupTemplate'
})

//List選項
Vue.component('select-piker', {
    props: ['titleName', 'value','dataHeader'],
    template: '#selectpickerTemplate',
    mixins: [commonMixin],
    data: function () {
        return {
            val: null,
            items : [{
                    value: 1,
                    text: "選項一"
                },
                {
                    value: 2,
                    text: "選項二"
                }
            ]
        }
    },
    mounted: function () {
        this.val = this.value;
    },
    updated: function () {
        this.$emit('input', this.val); //回寫對應到dataModel
        $("#" + this.myid).val(this.val)
        $("#" + this.myid).selectpicker('refresh')
    },
    computed: {
        inputListeners: function () {
            var vm = this
            // `Object.assign` merges objects together to form a new object
            return Object.assign({},
                // We add all the listeners from the parent
                this.$listeners,
                // Then we can add custom listeners or override the
                // behavior of some listeners.
                {
                    // This ensures that the component works with v-model
                    change: function (event) {
                        vm.$emit('change', event.target.value)
                    }
                }
            )
        }
    }
})

//一般的select
Vue.component('normal-select', {
    props: ['titleName', 'value', 'placeholder'],
    template: '#normalSelectTemplate',
    data: function () {
        return {
            val: null
        }
    },
    mounted: function () {
        this.val = this.value;
    },
    updated: function () {
        this.$emit('input', this.val); //回寫對應到dataModel
    }
}
)

Vue.component('radio-button', {
    props: ['titleName', 'value', 'items', 'setDisabled'],
    template: '#radioButtonTemplate',
    mixins: [commonMixin],
    data: function () {
        return {
            val: null
        }
    },
    mounted: function () {
        this.val = this.value
    },
    updated:function() {
        this.$emit("input", this.val)
    }
}
)

//日期年月日
Vue.component('date-ymd', {
    props: ['titleName', 'value', 'setDisabled'],
    template: '#dateymdTemplate',
    data: function () {
        return {
            yearVal: null,
            monthVal:null,
            dayVal:null,
            ymdResult:null,
        }
    },
    mixins: [commonMixin],
    watch: {
        yearVal: function (val) {
          this.ymdResult = val 
          this.ymdResult += _.isNull(this.monthVal)?"":_.padStart(this.monthVal, 2, '0')
          this.ymdResult += _.isNull(this.dayVal)?"":_.padStart(this.dayVal, 2, '0')
          this.$emit('input', this.ymdResult); //reflect to parent dataModel
        },
        monthVal: function (val) {
            this.ymdResult = _.isNull(this.yearVal)?"":this.yearVal
            this.ymdResult += _.padStart(val, 2, '0')
            this.ymdResult += _.isNull(this.dayVal)?"":_.padStart(this.dayVal, 2, '0')
            this.$emit('input', this.ymdResult); //reflect to parent dataModel
          },
        dayVal: function (val) {
            this.ymdResult = _.isNull(this.yearVal)?"":this.yearVal
            this.ymdResult += _.isNull(this.monthVal)?"":_.padStart(this.monthVal, 2, '0')
            this.ymdResult += _.padStart(val, 2, '0')
            this.$emit('input', this.ymdResult); //reflect to parent dataModel
        }
    }
})

//日期年月
Vue.component('date-ym', {
    props: ['titleName', 'value', 'setDisabled'],
    template: '#dateymTemplate',
    mixins: [commonMixin],
    data: function () {
        return {
            yearVal: null,
            monthVal:null,
            ymResult:null
        }
    },
    watch: {
        yearVal: function (val) {
          this.ymResult = val 
          this.ymResult += _.isNull(this.monthVal)?"":_.padStart(this.monthVal, 2, '0')
          this.$emit('input', this.ymResult); //reflect to parent dataModel
        },
        monthVal: function (val) {
            this.ymResult = _.isNull(this.yearVal)?"":this.yearVal
            this.ymResult += _.padStart(val, 2, '0') 
            this.$emit('input', this.ymResult); //reflect to parent dataModel
          }
        }
})

Vue.component('hotai-table', {
    props: ['titleName'],
    template: '#tableTemplate',
    mixins: [commonMixin],
    data: function () {
        return {
            val: null,
            dataSet:[
                [ "Tiger Nixon", "System Architect", "Edinburgh", "5421", "2011/04/25", "$320,800" ],
                [ "Garrett Winters", "Accountant", "Tokyo", "8422", "2011/07/25", "$170,750" ]
            ]
        }
    },
    mounted: function () {
        $("#" + this.myid).DataTable({
            "paging":   false,
            "ordering": false,
            "info":     false,
            data: this.dataSet
    })},
}
)


//程式主體
var app = new Vue({
    el: '#container',
    data: {
        formdata: {
            stringvalue: '預設值',
            stringvaluedisabled: '預設值',
            stringvalueicon: '預設值',
            stringcus: '預設值',
            seletvalue: '',
            normalseletvalue:'',
            ymdvalue:'',
            ymvalue:'',
            items: [{
                name: '自然人',
                value: true
            }, {
                name: '法人',
                value: false
            }],
            radiovalue: false
        }
    }
})

const { Machine, actions, interpret } = XState; // global vari

const toggleMachine = Machine({
    id: 'toggle',
    context: {
      /* some data */
    },
    initial: 'inactive',
    states: {
      inactive: {
        on: { TOGGLE: 'active' }
      },
      active: {
        on: { TOGGLE: 'inactive' }
      }
    }
  });

  console.log(toggleMachine.initialState)

 var stateService = interpret(toggleMachine)

 stateService.start()
 console.log('初始值')
 console.log(stateService.state.value)
 stateService.send('TOGGLE')
 console.log('轉換後')
 console.log(stateService.state.value)


$(function () {
    $.get("https://localhost:5001/Home/GetTestData", function (result) {
        console.log(result);
    });


})