//定義Column size
const colSize = {
    Normal: "col-lg-3 col-md-6 col-sm-6 col-xs-12 input-group",
    Middle1: "col-lg-3 col-md-6 col-sm-12 col-xs-12 input-group",
    Middle2: "col-lg-4 col-md-10 col-sm-12 col-xs-12 input-group",
    Middle3: "col-lg-6 col-md-10 col-sm-12 col-xs-12 input-group",
    Middle4: "col-lg-6 col-md-6 col-sm-6 col-xs-12 input-group",
    Middle5: "col-lg-6 col-xs-12 input-group",
    Middle6: "col-lg-4 col-md-6 col-sm-12 col-xs-12 input-group",
    Middle7: "col-lg-3 col-md-4 col-sm-6 col-xs-12 input-group",
    Big: "col-lg-12 col-md-12 col-sm-12 col-xs-12 input-group",
}

function lookupItems(looktype) {
    var $d = $.Deferred()
    var apiUrl = "/Quotation/LookupNameAttributes"
    $.ajax({
        url: apiUrl,
        type: "POST",
        dataType: "json",
        data: { lookType: looktype },
        success: function (data) {
            //console.log(data)
            if (looktype == 'StateProvCd') {
                var result = _.filter(JSON.parse(data), function (item) {
                    return item.countryCd == 'TW'
                })
                result = _.map(result, function (item) {
                    return { code: item.code, name: item.defaultValue }
                })
                $d.resolve(result)
            } else if (looktype == 'CityCd') {
                var result = _.map(JSON.parse(data), function (item) { return { code: item.code, name: item.defaultValue, state: item.stateProvCd } })
                $d.resolve(result)
            } else {
                var result = _.map(JSON.parse(data), function (item) { return { code: item.code, name: item.defaultValue} })
                $d.resolve(result)
            }
        },
        error: AjaxError
    });
    return $d.promise();
}

//QuoteBasic => 保單基本資料
//SalesManData => 招攬機構/業務人員資料
//InsurerData => 要保人及被保險人資料
//CarInfo => 車籍資料
//InsInfo => 投保險種資料
//OtherData => 其他約定事項
//ReadySubmit => 準備傳送
const actionStates = {
    initial: 'action',
    states: {
        Action: {
            on: {
                Toggle: 'Edit'
            }
        },
        Edit: {
            on: {
                Toggle: 'Action'
            }
        },
        Stop: {}
    }
};

//設定有限狀態機
const stateMachine = XState.Machine({
    id: 'toggle',
    context: {
        QuoteBasicAction: true,
        SalesManDataAction: true,
        InsurerDataAction: true,
        CarInfoAction: true,
        InsInfoAction: true,
        OtherDataAction: true,
        HotVehicleCategory: [],
        StateProvCd:[],
        CityCd:[],
        PointDiff:[],
        Grade:[],
        HotMonthlyDepreciationRate: [],
        RelToPolicyHolder:[],
        BeneficiaryRelToDriver:[]
    },
    initial: 'QuoteBasic',
    states: {
        //保單基本資料
        QuoteBasic: {
            on: {
                NextStep: 'SalesManData'
            },
            activities: ['getcode','getaddress', 'getRelToPolicyHolder','getBeneficiaryRelToDriver','getpointdiff','getgrade','getHotMonthlyDepreciationRate'],
        },
        //招攬機構/業務人員資料
        SalesManData: {
            on: {
                NextStep: 'InsurerData'
            },
            activities: [],
        },
        //要保人及被保險人資料
        InsurerData: {
            on: {
                NextStep: 'CarInfo'
            },
            activities: [],
        },
        //車籍資料
        CarInfo: {
            on: {
                NextStep: 'InsInfo'
            }
        },
        //投保險種資料
        InsInfo: {
            on: {
                NextStep: 'OtherData'
            },
            activities: [],
        },
        //其他約定事項
        OtherData: {
            on: {
                NextStep: 'ReadySumit'
            }
        },
        //準備新增
        ReadySumit: {
            on: {
                Draft: {
                    actions: function (content, event) {
                        console.log("暫存")
                    }
                },
                Save: {
                    actions: function (content, event) {
                        console.log("確定儲存")
                    }
                },
                Clear: {
                    actions: function (content, event) {
                        console.log("清除")
                    }
                }
            }
        },
    },
    on: {
        JumpToQuoteBasic: '.QuoteBasic',
        JumpToSalesManData: '.SalesManData',
        JumpToInsurerData: '.InsurerData',
        JumpToCarInfo: '.CarInfo',
        JumpToInsInfo: '.InsInfo',
        JumpToOtherData: '.OtherData',
    }
},
 {
     activities: {
         getcode: function (context, activity) {
             //console.log(context)
             //console.log(activity)
             if (!context.HotVehicleCategory.length) {
                 //車種	 HotVehicleCategory
                 $.blockUI({ message: '處理中請稍後...' })
                 console.time("取得HotVehicleCategory花費時間:")
                 lookupItems('HotVehicleCategory').done(function (res) {
                     context.HotVehicleCategory = res
                     console.timeEnd("取得HotVehicleCategory花費時間:")
                 })
                 $.unblockUI()
             }
         },
         getaddress: function (context, activate) {
             //地址(縣市)	 StateProvCd
             if (!context.StateProvCd.length) {
                 $.blockUI({ message: '處理中請稍後...' })
                 console.time("取得StateProvCd花費時間:")
                 lookupItems('StateProvCd').done(function (res) {
                     //console.log(result)
                     context.StateProvCd = res
                     console.timeEnd("取得StateProvCd花費時間:")
                 })
                 console.time("取得CityCd花費時間:")
                 //地址(鄉鎮市區)	 CityCd
                 lookupItems('CityCd').done(function (res) {
                     context.CityCd = res
                     console.timeEnd("取得CityCd花費時間:")
                     $.unblockUI()
                 })
             }
         },
         getRelToPolicyHolder: function (context, activity) {
             if (!context.RelToPolicyHolder.length) {
                 //與要保人的關係RelToPolicyHolder
                 $.blockUI({ message: '處理中請稍後...' })
                 console.time("取得RelToPolicyHolder花費時間:")
                 lookupItems('RelToPolicyHolder').done(function (res) {
                     context.RelToPolicyHolder = res
                     console.timeEnd("取得RelToPolicyHolder花費時間:")
                 })
                 $.unblockUI()
             }
         },
         getBeneficiaryRelToDriver: function (context, activity) {
             //console.log(context)
             //console.log(activity)
             if (!context.BeneficiaryRelToDriver.length) {
                 //與列名駕駛人的關係	 BeneficiaryRelToDriver
                 $.blockUI({ message: '處理中請稍後...' })
                 console.time("取得BeneficiaryRelToDriver花費時間:")
                 lookupItems('BeneficiaryRelToDriver').done(function (res) {
                     context.BeneficiaryRelToDriver = res
                     console.timeEnd("取得BeneficiaryRelToDriver花費時間:")
                 })
                 $.unblockUI()
             }
         },
         getpointdiff: function (context, activity) {
             //console.log(context)
             //console.log(activity)
             if (!context.PointDiff.length) {
                 //體係	 PointDiff
                 $.blockUI({ message: '處理中請稍後...' })
                 console.time("取得PointDiff花費時間:")
                 lookupItems('PointDiff').done(function (res) {
                     context.PointDiff = res
                     console.timeEnd("取得PointDiff花費時間:")
                 })
                 $.unblockUI()
             }
         },
         getgrade: function (context, activity) {
             //console.log(context)
             //console.log(activity)
             if (!context.Grade.length) {
                 //責係	 Grade
                 $.blockUI({ message: '處理中請稍後...' })
                 console.time("取得Grade花費時間:")
                 lookupItems('Grade').done(function (res) {
                     context.Grade = res
                     console.timeEnd("取得Grade花費時間:")
                 })
                 $.unblockUI()
             }
         },
         getHotMonthlyDepreciationRate: function (context, activity) {
             //console.log(context)
             //console.log(activity)
             if (!context.HotMonthlyDepreciationRate.length) {
                 //折舊率	 HotMonthlyDepreciationRate
                 $.blockUI({ message: '處理中請稍後...' })
                 console.time("取得HotMonthlyDepreciationRate花費時間:")
                 lookupItems('HotMonthlyDepreciationRate').done(function (res) {
                     context.HotMonthlyDepreciationRate = res
                     console.timeEnd("取得HotMonthlyDepreciationRate花費時間:")
                 })
                 $.unblockUI()
             }
         },
     }
 }

);

//程式主體
const app = new Vue({
    el: '#container',
    created: function () {
        // Start service on component creation
        this.quoteService
          .onTransition(function (state) {
              // Update the current state component data property with the next state
              this.current = state.value;
              // Update the context component data property with the updated context
              this.context = state.context;
          })
          .start();
    },
    mounted: function () {
        var vm = this
        function promiseGetLookup() {
            console.time("取得代碼總共花費時間:")
            console.time("取得HotVehicleCategory花費時間:")
            //車種	 HotVehicleCategory
            vm.lookupItems('HotVehicleCategory').done(function (res) {
                var result = JSON.parse(res)
                console.log(result)
                vm.hotVehicleCategory = result
                console.timeEnd("取得HotVehicleCategory花費時間:")
            })
            console.time("取得StateProvCd花費時間:")
            //地址(縣市)	 StateProvCd
            vm.lookupItems('StateProvCd').done(function (res) {
                var result = _.filter(JSON.parse(res), function (o) { return o.countryCd == 'TW'; });
                //console.log(result)
                vm.stateProvCd = result
                console.timeEnd("取得StateProvCd花費時間:")
            })
            console.time("取得CityCd花費時間:")
            //地址(鄉鎮市區)	 CityCd
            vm.lookupItems('CityCd').done(function (res) {
                var result = JSON.parse(res)
                //console.log(result)
                vm.cityCd = result
                console.timeEnd("取得CityCd花費時間:")
            })
            console.time("取得RelToPolicyHolder花費時間:")
            //與被保險人關係	 RelToPolicyHolder
            vm.lookupItems('RelToPolicyHolder').done(function (res) {
                var result = JSON.parse(res)
                //console.log(result)
                vm.relToPolicyHolder = result
                console.timeEnd("取得RelToPolicyHolder花費時間:")
            })
            console.time("取得Country花費時間:")
            //國別	 Country
            vm.lookupItems('Country').done(function (res) {
                var result = JSON.parse(res)
                //console.log(result)
                vm.country = result
                console.timeEnd("取得Country花費時間:")
            })

            console.time("取得PointDiff花費時間:")
            //體係	 PointDiff
            vm.lookupItems('PointDiff').done(function (res) {
                var result = JSON.parse(res)
                //console.log(result)
                vm.pointDiff = result
                console.timeEnd("取得PointDiff花費時間:")
            })

            console.time("取得Grade花費時間:")
            //責係	 Grade
            vm.lookupItems('Grade').done(function (res) {
                var result = JSON.parse(res)
                //console.log(result)
                vm.grade = result
                console.timeEnd("取得Grade花費時間:")
            })

            console.time("取得HotMonthlyDepreciationRate花費時間:")
            //折舊率	 HotMonthlyDepreciationRate
            vm.lookupItems('HotMonthlyDepreciationRate').done(function (res) {
                var result = JSON.parse(res)
                //console.log(result)
                vm.hotMonthlyDepreciationRate = result
                console.timeEnd("取得HotMonthlyDepreciationRate花費時間:")
            })

            //付款方式	 通过呼叫GET /agent/v1/customers/{customerNumber}/payment-methods
            //vm.lookupItems('PaymentMethods').done(function (res) {
            //    //var result = JSON.parse(res)
            //    console.log(result)
            //    //vm.paymentMethods = result
            //})

            console.time("取得BeneficiaryRelToDriver花費時間:")
            //this.lookupItems('HotVehicleCategory')
            //與列名駕駛人的關係	 BeneficiaryRelToDriver
            vm.lookupItems('BeneficiaryRelToDriver').done(function (res) {
                var result = JSON.parse(res)
                //console.log(result)
                vm.beneficiaryRelToDriver = result
                console.timeEnd("取得BeneficiaryRelToDriver花費時間:")
            })
            console.timeEnd("取得代碼總共花費時間:");
        }

        //this.togglePanel()
        //console.time("一次取得所有代碼總共花費時間:")
        //$.ajax({
        //    url: "/EISQuotation/AllLookupName",
        //    type: "POST",
        //    dataType: "json",
        //    async: false,
        //    success: function (data) {
        //        console.log(data)
        //        console.timeEnd("一次取得所有代碼總共花費時間:")
        //    },
        //    error: AjaxError
        //});
        //$.unblockUI()
        //console.log('狀態機初始值:' + this.current)
    },
    data: function () {
        return {
            model: {
                selMANMVPZMTYPE: "",
                selMVPZMTYPE:"",
            },
            url: "/EISQuotation/LookupName",
            urlattribute: "/EISQuotation/LookupNameAttributes",
            urlpayment: "/EISQuotation/PaymentMethods",
            stateProvCd: [],
            hotVehicleCategory: [],
            relToPolicyHolder: [],
            cityCd: [],
            country: [],
            pointDiff: [],
            grade: [],
            hotMonthlyDepreciationRate: [],
            beneficiaryRelToDriver: [],
            paymentMethods: [],
            // Interpret the machine and store it in data
            quoteService: XState.interpret(stateMachine, { devTools: true }),

            stateMachine: stateMachine,

            // Set current state value
            current: stateMachine.initial,

            // Start with the machine's initial context
            context: stateMachine.context,

            // Bootstrap column size
            colSize: colSize,

            actionButton: true
        };
    },
    methods: {
        // Send events to the service
        send: function (event) {
            this.quoteService.send(event);
            this.current = this.quoteService.state.value;
        },
        //直接跳到某個state
        jumpAction: function (eventName) {
            var somestate = this.quoteService.send(eventName)
            this.current = this.quoteService.state.value;
            // 全部設為編輯
            this.context.QuoteBasicAction = false
            this.context.SalesManDataAction = false
            this.context.InsurerDataAction = false
            this.context.CarInfoAction = false
            this.context.InsInfoAction = false
            this.context.OtherDataAction = false
            // 再針對目前在哪一個狀態設為下一步
            switch (this.current) {
                case "QuoteBasic":
                    this.context.QuoteBasicAction = true
                    break
                case "SalesManData":
                    this.context.SalesManDataAction = true
                    break
                case "InsurerData":
                    this.context.InsurerDataAction = true
                    break
                case "CarInfo":
                    this.context.CarInfoAction = true
                    break
                case "InsInfo":
                    this.context.InsInfoAction = true
                    break
                case "OtherData":
                    this.context.OtherDataAction = true
                    break
                default:
            }
        },
        // 下一步    
        changeAction: function () {
            // 將按鈕狀態切換
            switch (this.current) {
                case "QuoteBasic":
                    this.context.QuoteBasicAction = !this.context.QuoteBasicAction
                    $.unblockUI()
                    break
                case "SalesManData":
                    this.context.SalesManDataAction = !this.context.SalesManDataAction
                    break
                case "InsurerData":
                    this.context.InsurerDataAction = !this.context.InsurerDataAction
                    break
                case "CarInfo":
                    this.context.CarInfoAction = !this.context.CarInfoAction
                    break
                case "InsInfo":
                    this.context.InsInfoAction = !this.context.InsInfoAction
                    break
                case "OtherData":
                    this.context.OtherDataAction = !this.context.OtherDataAction
                    break
                default:
            }
            this.send('NextStep')
        },
    }
}
)
