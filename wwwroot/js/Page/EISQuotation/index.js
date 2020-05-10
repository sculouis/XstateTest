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
                SalesManData: 'SalesManData'
            },
            entry: ['setAction'],
            exit: ['setUnAction'],
            //activities: ['getcode', 'getaddress', 'getRelToPolicyHolder', 'getBeneficiaryRelToDriver', 'getpointdiff', 'getgrade', 'getHotMonthlyDepreciationRate'],
        },
        //招攬機構/業務人員資料
        SalesManData: {
            on: {
                InsurerData: 'InsurerData'
            },
            entry: ['setAction'],
            exit: ['setUnAction'],
            activities: [],
        },
        //要保人及被保險人資料
        InsurerData: {
            on: {
                CarInfo: 'CarInfo'
            },
            entry: ['setAction'],
            exit: ['setUnAction'],
            activities: [],
        },
        //車籍資料
        CarInfo: {
            on: {
                InsInfo: 'InsInfo'
            },
            entry: ['setAction'],
            exit: ['setUnAction'],
        },
        //投保險種資料
        InsInfo: {
            on: {
                OtherData: 'OtherData'
            },
            entry: ['setAction'],
            exit: ['setUnAction'],
            activities: [],
        },
        //其他約定事項
        OtherData: {
            on: {
                ReadySumit: 'ReadySumit'
            },
            entry: ['setAction'],
            exit: ['setUnAction'],
        },
        //準備新增
        ReadySumit: {},
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
        //進入此狀態設定為下一步xxxxAction = 1
        setAction: function (context, event) {
            console.log(`entry: ${event.type}`)
            if (event.type.substring(0, 6) == "JumpTo") {
                var stateName = event.type.substring(6)
                context.ActionFlag[stateName + 'Action'] = 1
                //此狀態以下的button全改為隱藏
                const actionArr = Object.keys(context.ActionFlag);
                const index = _.findIndex(actionArr, function(item) { return item == stateName + 'Action'; });
                const disableArr = actionArr.slice(index + 1)
                _.forEach(disableArr, function(item){
                    context.ActionFlag[item] = 0
                })
            } else {
                if (event.type != "xstate.init"){
                context.ActionFlag[event.type + 'Action'] = 1
                }
            }
        },
        //離開此狀態設定為編輯xxxxAction = 2
        setUnAction: function (context, event) {
            console.log(`exit: get into ${event.type}`)
            const actionArr = Object.keys(context.ActionFlag);
            const index = _.findIndex(actionArr, function(item) { return item == event.type + 'Action'; });
            context.ActionFlag[actionArr[index - 1]] = 2
        },
    }
});

// define context
const stateMachineContext = stateMachine.withContext({
    ActionFlag: {
        QuoteBasicAction: 1,
        SalesManDataAction: 0,
        InsurerDataAction: 0,
        CarInfoAction: 0,
        InsInfoAction: 0,
        OtherDataAction: 0,
    },
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

            actionFlag: stateMachineContext.context.ActionFlag,

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
            var nextState = _.filter(this.quoteService.state.nextEvents, function (e) {
                return e.substring(0, 6) != 'JumpTo';
            });
            this.send(nextState[0])
        },
    }
})