/**
 * Created by jdebray on 02/11/2015.
 */
var Popin = React.createClass({
    render : function () {
        return (
            <div>
                <section ref="overlay" className={this.props.overlay ? 'react-popin-component-overlay' : 'react-popin-component-overlay-hide'}></section>
                <section ref="popin" className={this.props.className}></section>
            </div>
        );
    }
});
var PopinComponent = React.createClass({
    getInitialState : function () {
        return {data : {
                overlay : false,
                display : 'react-popin-component-hide'
            }
        };
    },
    handlePopin : function () {
        if (this.state.display === 'react-popin-component-show') {
            if (this.props.overlay) {
                this.setState({overlay : false});
            }
            this.setState({display : 'react-popin-component-hide'});
        } else {
            if (this.props.overlay) {
                this.setState({overlay : true});
            }
            this.setState({display : 'react-popin-component-show'});
        }
    },
    render : function() {
        return (
            <div>
                <Popin overlay={this.state.overlay} className={this.state.display}/>
                <a href="javascript:void(0);" onClick={this.handlePopin}>test popin</a>
            </div>
        );
    }
});
ReactDOM.render(
    <PopinComponent overlay="1"/>,
    document.getElementById('popin')
);
