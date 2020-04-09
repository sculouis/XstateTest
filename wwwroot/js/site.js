// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
// Define a new component called button-counter



Vue.component('hmenu', {
    data: function () {
        return {
            menus: [{
                    uri: "/Quote/QuoteIndex?test",
                    name: '簡易試算'
                },
                {
                    uri: "/Quotation/QuotationEdit",
                    name: '新件報價'
                },
                {
                    uri: "/Quotation/QuotationEdit?ConQuot",
                    name: '續保件報價'
                },
                {
                    uri: "/Quotation/QuotationQuery",
                    name: '報價單查詢'
                },
                {
                    uri: "QuotationBatch",
                    name: '團體件報價專區'
                },
                // { uri:"" ,name:'表單下載專區',
                // secondmenus:[
                //     { uri:"/FormTemplate/團體件報價空白表單.xlsx" ,name:'團體件空白表單' },
                //     { uri:"/FormTemplate/汽車保險業務承保資料表.pdf" ,name:'汽車保險業務承保資料表' },
                //     { uri:"/FormTemplate/汽車險勘車連絡單.pdf" ,name:'汽車險勘車連絡單' },
                //     { uri:"/FormTemplate/傷害險被保險人名冊.xlsx" ,name:'傷害險被保險人名冊' }
                // ]
                // },
                {
                    uri: "/EISQuotation/EISQuotation",
                    name: 'EIS新件報價'
                },
            ]
        }
    },
    template: '#hotainsmenu'
})

Vue.component('main-panel', {
    props: ['titleName', 'mainPanelId'],
    template: '#mpanel'
})

Vue.component('panel', {
    props: ['panelName', 'panelId'],
    template: '#hotainspanel'
})


// 文字輸入框 
Vue.component('input-string', {
    template: '#textbox',
    props: ['titleName', 'value', 'placeHolder', 'setDisabled'],
    data: function () {
        return {
            val: "",
        };
    },
    mounted: function () {
        this.val = this.value;
    },
    updated: function () {
        this.$emit('input', this.val); //回寫對應到dataModel
    },
    computed: {
        isDisabled:function() {
            if (this.setDisabled == 'false') {
                return false;
            } else {
                return true;
            }
        }
    }
})

Vue.component('textbox', {
    props: ['titleName'],
    template: '#inputcontainer'
})

Vue.component('selecter', {
    props: ['titleName', 'selectId', 'inputId'],
    template: '#selectpicker'
})





var app = new Vue({
    el: '#container',
    data: {
        message: 'Hello Vue!',
        formdata: {
            seletvalue: '',
            stringvalue: ''
        }
    }
})

$(function () {

    $.get("https://localhost:5001/Home/GetTestData", function (result) {
        console.log(result);
    });

})