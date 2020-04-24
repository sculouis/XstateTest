// 共用模組
var commonMixin = {
    created: function () {
        this.myid = this.uuid()
    },
    data: function () {
        return {
            val: "",
            showRequired: false,
            showDisabled: false,
            classStyle: "col-lg-3 col-md-6 col-sm-6 col-xs-12 input-group"
        };
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
    mounted: function () {
        this.val = this.value
        this.showRequired = _.isUndefined(this.required) ? false : true
        this.showDisabled = _.isUndefined(this.disabled) ? false : this.disabled
        if (_.isUndefined(this.maxlength) == false) {
            this.length = this.maxlength
        }
        if (_.isUndefined(this.classEnum) == false) {
            this.classStyle = this.classEnum
        }

    }
}

Vue.component('hotai-menu', {
    props: ['menus'],
    mounted: function () {
        console.log(this.menus)
    },
    template: '#menuTemplate'
})

Vue.component('main-panel', {
    props: ['titleName'],
    template: '#mainPanelTemplate'
})

Vue.component('panel', {
    props: ['titleName','showBody'],
    template: '#panelTemplate',
    mixins: [commonMixin],
    mounted: function () {
        //console.log(this.showBody)
    }
})

Vue.component('notitle-panel', {
    template: '#noTitlePanelTemplate',
})

// 文字輸入框 
Vue.component('input-text', {
    template: '#inputTextTemplate',
    mixins: [commonMixin],
    props: ['titleName', 'classEnum', 'value', 'placeholder', 'required', 'disabled', 'maxlength'],
    data: function () {
        return {
            length: 50
        }
    },
    updated: function () {
        this.$emit('input', this.val); //reflect to parent dataModel
    }
})

// 文字輸入框(單位) 
Vue.component('input-text-unit', {
    template: '#inputTextUnitTemplate',
    mixins: [commonMixin],
    props: ['titleName', 'classEnum', 'value', 'placeholder', 'unitName','required', 'disabled', 'maxlength'],
    data: function () {
        return {
            length: 50
        }

    },
    updated: function () {
        this.$emit('input', this.val); //reflect to parent dataModel
    }
})

Vue.component('input-text-icon', {
    props: ['titleName', 'value','classEnum', 'iconName', 'buttonTitle', 'placeholder', 'required', 'disabled'],
    template: '#inputTextIconTemplate',
    mixins: [commonMixin],
    data: function () {
        return {
            baseClass: 'fa',
            iconClass: '',
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

Vue.component('normal-select-icon', {
    props: ['titleName', 'value','classEnum', 'iconName', 'buttonTitle', 'placeholder', 'required', 'disabled'],
    template: '#normalSelectIconTemplate',
    mixins: [commonMixin],
    data: function () {
        return {
            baseClass: 'fa',
            iconClass: '',
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
    props: ['titleName', 'classEnum'],
    template: '#inputGroupTemplate',
    mixins: [commonMixin],
    data: function () {
        return {
            length: 50
        }

    },
})

//List選項
Vue.component('select-piker', {
    props: ['titleName', 'value','classEnum', 'dataHeader', 'required', 'disabled'],
    template: '#selectpickerTemplate',
    mixins: [commonMixin],
    data: function () {
        return {
            val: null,
            items: [{
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
    props: ['titleName', 'value', 'placeholder', 'required', 'disabled', 'classEnum','items'],
    template: '#normalSelectTemplate',
    mixins: [commonMixin],
    data: function () {
        return {
            codeitem:[]
        }
    },
    mounted: function () {
        this.codeitems = this.items
    },
    updated: function () {
        this.$emit('input', this.val); //回寫對應到dataModel
    }
})

Vue.component('radio-button', {
    props: ['titleName', 'value', 'items', 'required', 'disabled','classEnum'],
    template: '#radioButtonTemplate',
    mixins: [commonMixin],
    updated: function () {
        this.$emit("input", this.val)
    }
})

//日期年月日
Vue.component('date-ymd', {
    props: ['titleName', 'value', 'required', 'disabled','classEnum'],
    template: '#dateymdTemplate',
    mixins: [commonMixin],
    data: function () {
        return {
            yearVal: null,
            monthVal: null,
            dayVal: null,
            ymdResult: null,
        }
    },
    watch: {
        yearVal: function (val) {
            this.ymdResult = val
            this.ymdResult += _.isNull(this.monthVal) ? "" : _.padStart(this.monthVal, 2, '0')
            this.ymdResult += _.isNull(this.dayVal) ? "" : _.padStart(this.dayVal, 2, '0')
            this.$emit('input', this.ymdResult); //reflect to parent dataModel
        },
        monthVal: function (val) {
            this.ymdResult = _.isNull(this.yearVal) ? "" : this.yearVal
            this.ymdResult += _.padStart(val, 2, '0')
            this.ymdResult += _.isNull(this.dayVal) ? "" : _.padStart(this.dayVal, 2, '0')
            this.$emit('input', this.ymdResult); //reflect to parent dataModel
        },
        dayVal: function (val) {
            this.ymdResult = _.isNull(this.yearVal) ? "" : this.yearVal
            this.ymdResult += _.isNull(this.monthVal) ? "" : _.padStart(this.monthVal, 2, '0')
            this.ymdResult += _.padStart(val, 2, '0')
            this.$emit('input', this.ymdResult); //reflect to parent dataModel
        }
    }
})

//日期年月
Vue.component('date-ym', {
    props: ['titleName', 'value', 'required', 'disabled','classEnum'],
    template: '#dateymTemplate',
    mixins: [commonMixin],
    data: function () {
        return {
            yearVal: null,
            monthVal: null,
            ymResult: null,
        }
    },
    watch: {
        yearVal: function (val) {
            this.ymResult = val
            this.ymResult += _.isNull(this.monthVal) ? "" : _.padStart(this.monthVal, 2, '0')
            this.$emit('input', this.ymResult); //reflect to parent dataModel
        },
        monthVal: function (val) {
            this.ymResult = _.isNull(this.yearVal) ? "" : this.yearVal
            this.ymResult += _.padStart(val, 2, '0')
            this.$emit('input', this.ymResult); //reflect to parent dataModel
        }
    }
})

//jquery datatable
Vue.component('hotai-table', {
    props: ['titleName', 'items'],
    template: '#tableTemplate',
    mixins: [commonMixin],
    data: function () {
        return {
            dataSet: [
                ['test1', 201, 123.12, '2020/04/13', '中文', true, false],
                ['test2', 999, 123.12, '2020/04/13', 'Some Data', true, false],
            ]
        }
    },
    mounted: function () {
        $("#" + this.myid).DataTable({
            data: this.dataSet
        })
    }
})

Vue.component('model', {
    props: ['titleName', 'id'],
    template: '#modelTemplate',
    mixins: [commonMixin],
})

Vue.component('hotain-button', {
    props: {titleName:String,btnName:String, iconName:String, disabled:String,showButton:Boolean},
    template: '#buttonTemplate',
    mixins: [commonMixin],
    data: function () {
        return {
            iconClass: '',
            btnClass: ''
        }
    },
    mounted: function () {
        this.iconClass = this.iconName
        this.btnClass = this.btnName
        console.log(this.showButton)
    },
})
