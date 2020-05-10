const { Machine, actions, interpret } = XState; // global variable

var machine = Machine({
    id: 'toggle',
    context: {
      /* some data */
    },
    initial: 'inactive',
    states: {
      inactive: {
        on: { TOGGLE: 'active' },
        entry: ['setSearchFlag']
      },
      active: {
        on: { TOGGLE: 'inactive' },
        entry: ['setResultFlag']
      }
    },
  },    
  {actions: {
    //進入此狀態設定為下一步xxxxAction = 1
    setSearchFlag: function (context, event) {
        context.ActionFlag.showSearch = true
        context.ActionFlag.showResult = false
        console.log(context.ActionFlag.showSearch)
        console.log("entry:" + event.type)
    },
    setResultFlag: function (context, event) {
      context.ActionFlag.showSearch = false
      context.ActionFlag.showResult = true
      console.log(context.ActionFlag.showSearch)
      console.log("entry:" + event.type)
  }

  }
}
);

  // define context
const machineContext = machine.withContext({
  ActionFlag: {
    showSearch:true,
    showResult:false,
},
})

 
var Search = {
    template: '#search',
    props:['current','titleName','showBody'],
    methods: {
      onFetch: function() {
          this.$parent.onFetch()
      }
    }
  };

var Result = {
  template: '#result',
  props:['current','titleName','showBody'],
  methods: {
    onFetch: function() {
        this.$parent.onFetch()
    }
  }
};

var example2 = new Vue({
    el: '#xstateTest',
    components: {
        'search': Search,
        'query-result':Result
      },
    created: function () {
        var vm = this
        // Start service on component creation
        this.service
            .onTransition(function (state) {
                // Update the current state component data property with the next state
                vm.current = state.value;
                // Update the context component data property with the updated context
                vm.context = state.context;
            })
            .start();
    },
    data: function () {
        return {
            current: machineContext.initial,
            context: machineContext.context,
            // Interpret the machine and store it in data
            service: interpret(machineContext, {
                devTools: true
            }),
        }
    },
    computed:{
      showSearch:function(){
        return this.context.ActionFlag.showSearch
      },
      showResult:function(){
        return this.context.ActionFlag.showResult
      }
    },
    methods: {
        onFetch() {
            this.service.send({type: 'TOGGLE'});
        }
    }  })

 