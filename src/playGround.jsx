import React from 'react';
import ReactDom from 'react-dom';

class ChildOneNode extends React.Component {
	constructor(props){
		super(props);
		this.state = {content:'i am childOne'};
		this.handleClick = this.props.fnfromparen;
	}
    
    render(){
    	return (<button onClick={ this.handleClick  }>test1</button>);
    }


}

class ChildTwoNode extends React.Component {
	constructor(props){
		super(props);
		this.state = {content:'i am childTwo'};
		this.handleClick = this.props.fnfromparen.bind(this);
	}
    
    render(){
    	return (<button onClick={ this.handleClick  }>test2</button>);
    }


}



class ParentNode extends React.Component {
	constructor(props) {
		super(props);
		this.state = {content:'I am parent'}
		// this.handlerFn = this.handlerFn.bind(this);
	}

	handlerFn(){
		console.log(this.state.content);
	};
    

	render(){
		return (<div>
			      <ChildOneNode fnfromparen = { this.handlerFn } />
		          <ChildTwoNode fnfromparen = { this.handlerFn } />
		         </div>);
	}
}


var renderModule = function(node){
	ReactDom.render(
	<ParentNode />,
	node
	)
};

module.exports = renderModule;