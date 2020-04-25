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
        data: {
            lookType: looktype
        },
        success: function (data) {
            //console.log(data)
            if (looktype == 'StateProvCd') {
                var result = _.filter(JSON.parse(data), function (item) {
                    return item.countryCd == 'TW'
                })
                result = _.map(result, function (item) {
                    return {
                        code: item.code,
                        name: item.defaultValue
                    }
                })
                $d.resolve(result)
            } else if (looktype == 'CityCd') {
                var result = _.map(JSON.parse(data), function (item) {
                    return {
                        code: item.code,
                        name: item.defaultValue,
                        state: item.stateProvCd
                    }
                })
                $d.resolve(result)
            } else {
                var result = _.map(JSON.parse(data), function (item) {
                    return {
                        code: item.code,
                        name: item.defaultValue
                    }
                })
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

//設定有限狀態機
const stateMachine = XState.Machine({
        id: 'toggle',
        initial: 'QuoteBasic',
        states: {
            //保單基本資料
            QuoteBasic: {
                on: {
                    NextStep: 'SalesManData'
                },
                entry:['setQuoteBasicAction'],
                exit:['setQuoteBasicAction'],
                activities: ['getcode', 'getaddress', 'getRelToPolicyHolder', 'getBeneficiaryRelToDriver', 'getpointdiff', 'getgrade', 'getHotMonthlyDepreciationRate'],
            },
            //招攬機構/業務人員資料
            SalesManData: {
                on: {
                    NextStep: 'InsurerData'
                },
                entry:['setSalesManDataAction'],
                exit:['setSalesManDataAction'],
                activities: [],
            },
            //要保人及被保險人資料
            InsurerData: {
                on: {
                    NextStep: 'CarInfo'
                },
                entry:['setInsurerDataAction'],
                exit:['setInsurerDataAction'],
                activities: [],
            },
            //車籍資料
            CarInfo: {
                on: {
                    NextStep: 'InsInfo'
                },
                entry:['setCarInfoAction'],
                exit:['setCarInfoAction'],
            },
            //投保險種資料
            InsInfo: {
                on: {
                    NextStep: 'OtherData'
                },
                entry:['setInsInfoAction'],
                exit:['setInsInfoAction'],
                activities: [],
            },
            //其他約定事項
            OtherData: {
                on: {
                    NextStep: 'ReadySumit'
                },
                entry:['setOtherDataAction'],
                exit:['setOtherDataAction'],
            },
            //準備新增
            ReadySumit: {
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
    }, {
        activities: {
            getcode: function (context, activity) {
                //console.log(context)
                //console.log(activity)
                if (!context.HotVehicleCategory.length) {
                    //車種	 HotVehicleCategory
                    BlockUI()
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
                    })
                }
            },
            getRelToPolicyHolder: function (context, activity) {
                if (!context.RelToPolicyHolder.length) {
                    //與要保人的關係RelToPolicyHolder
                    console.time("取得RelToPolicyHolder花費時間:")
                    lookupItems('RelToPolicyHolder').done(function (res) {
                        context.RelToPolicyHolder = res
                        console.timeEnd("取得RelToPolicyHolder花費時間:")
                    })
                }
            },
            getBeneficiaryRelToDriver: function (context, activity) {
                //console.log(context)
                //console.log(activity)
                if (!context.BeneficiaryRelToDriver.length) {
                    //與列名駕駛人的關係	 BeneficiaryRelToDriver
                    console.time("取得BeneficiaryRelToDriver花費時間:")
                    lookupItems('BeneficiaryRelToDriver').done(function (res) {
                        context.BeneficiaryRelToDriver = res
                        console.timeEnd("取得BeneficiaryRelToDriver花費時間:")
                    })
                }
            },
            getpointdiff: function (context, activity) {
                //console.log(context)
                //console.log(activity)
                if (!context.PointDiff.length) {
                    //體係	 PointDiff
                    console.time("取得PointDiff花費時間:")
                    lookupItems('PointDiff').done(function (res) {
                        context.PointDiff = res
                        console.timeEnd("取得PointDiff花費時間:")
                    })
                }
            },
            getgrade: function (context, activity) {
                //console.log(context)
                //console.log(activity)
                if (!context.Grade.length) {
                    //責係	 Grade
                    console.time("取得Grade花費時間:")
                    lookupItems('Grade').done(function (res) {
                        context.Grade = res
                        console.timeEnd("取得Grade花費時間:")
                    })
                }
            },
            getHotMonthlyDepreciationRate: function (context, activity) {
                //console.log(context)
                //console.log(activity)
                if (!context.HotMonthlyDepreciationRate.length) {
                    //折舊率	 HotMonthlyDepreciationRate
                    console.time("取得HotMonthlyDepreciationRate花費時間:")
                    lookupItems('HotMonthlyDepreciationRate').done(function (res) {
                        context.HotMonthlyDepreciationRate = res
                        console.timeEnd("取得HotMonthlyDepreciationRate花費時間:")
                    })
                }
            },
        },
        actions: {
            // action implementations
            setQuoteBasicAction: function(context, event) {
                if (event.type == "JumpToQuoteBasic" || event.type =="xstate.init"){
                    context.QuoteBasicAction = 1
                }else{
                    if (context.QuoteBasicAction == 1)
                    {
                        context.QuoteBasicAction = 2
                    }else{
                        context.QuoteBasicAction = 1
                }
            }
            },
            setSalesManDataAction: function(context, event) {
                if (context.SalesManDataAction == 1)
                {
                    context.SalesManDataAction = 2
                }else{
                    context.SalesManDataAction = 1
                }
            },
            setInsurerDataAction: function(context, event) {
                if (context.InsurerDataAction == 1)
                {
                    context.InsurerDataAction = 2
                }else{
                    context.InsurerDataAction = 1
                }
            },
            setCarInfoAction: function(context, event) {
                if (context.CarInfoAction == 1)
                {
                    context.CarInfoAction = 2
                }else{
                    context.CarInfoAction = 1
                }
            },
            setInsInfoAction: function(context, event) {
                if (context.InsInfoAction == 1)
                {
                    context.InsInfoAction = 2
                }else{
                    context.InsInfoAction = 1
                }
            },
            setOtherDataAction: function(context, event) {
                if (context.OtherDataAction == 1)
                {
                    context.OtherDataAction = 2
                }else{
                    context.OtherDataAction = 1
                }
            },
        }
    }
);

// define context
const stateMachineContext = stateMachine.withContext({
    QuoteBasicAction: 1,
    SalesManDataAction: 0,
    InsurerDataAction: 0,
    CarInfoAction: 0,
    InsInfoAction: 0,
    OtherDataAction: 0,
    HotVehicleCategory: [],
    StateProvCd: [],
    CityCd: [],
    PointDiff: [],
    Grade: [],
    HotMonthlyDepreciationRate: [],
    RelToPolicyHolder: [],
    BeneficiaryRelToDriver: []
})

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
    mounted: function () {},
    data: function () {
        return {
            model: {
                selMANMVPZMTYPE: "",
                selMVPZMTYPE: "",
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
            quoteService: XState.interpret(stateMachineContext, {
                devTools: true
            }),

            stateMachine: stateMachineContext,

            // Set current state value
            current: stateMachineContext.initial,

            // Start with the machine's initial context
            context: stateMachineContext.context,

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
            this.quoteService.send(eventName)
            this.current = this.quoteService.state.value;
        },
        // 下一步    
        changeAction: function () {
          this.send('NextStep')
        },
    }
})