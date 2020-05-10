const { Machine, actions, interpret } = XState; // global vari

var machine = Machine({
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
 
var Search = {
    template: '#search',
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
        'search': Search
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
            showSearch:true,
            current: machine.initial,
            context: machine.context,
            // Interpret the machine and store it in data
            service: interpret(machine, {
                devTools: true
            }),
        }
    },
    computed: {
        fetchContext:function() {
            return this.context;
        }
    },
    methods: {
        onFetch() {
            this.service.send({type: 'TOGGLE'});
        }
    }  })

 