var InputSearch = React.createClass({
    getInitialState : function(){
        return {data : []};
    },
    handleFocus: function(evt){

    },
    handleKeyUp: function(evt){
        var wordTyping = this.refs.query.value.trim();
        this.props.onInputKeyUp({wordTyping : wordTyping});
    },
    componentDidMount: function(){
        console.log('component mount');
    },
    render : function() {
        return (
            <label><input ref="query" placeholder={this.props.placeholder} onFocus={this.handleFocus} onKeyUp={this.handleKeyUp}/>{this.props.placeholder}</label>
        )
    }
});

var RenderInput = React.createClass({
    getInitialState: function(){
        return {data : []};
    },
    render : function(){
        return (
            <div>{this.props.wordTyping}</div>
        );
    }
});

var SearchBox = React.createClass({
    getInitialState : function(){
        return {data: []};
    },
    handleKeyUp : function (query) {
        this.setState({wordTyping: query.wordTyping});
    },
    render : function(){
        return (
            <div>
                <div>
                    Search an element
                </div>
                <InputSearch placeholder="Type your search" onInputKeyUp={this.handleKeyUp}/>
                <RenderInput wordTyping={this.state.wordTyping}/>
            </div>
        )
    }
});


ReactDOM.render(
    <SearchBox />,
    document.getElementById('search')
);
