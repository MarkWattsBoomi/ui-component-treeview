declare var manywho: any;

import * as React from 'react';
import './TreeView.css';

class TreeView extends React.Component<any, any> 
{   
    componentId: string = "";
    flowKey: string ="";    
    attributes = new Map<string,any>();
    childNodes: Array<TreeParentNode> = [];
    selectedItem: string = null;


    constructor(props : any)
	{
        super(props);
        
        this.componentId = props.id;
        this.flowKey = props.flowKey;

        //push attributes into keyed map 
		var flowModel = manywho.model.getComponent(this.props.id,   this.props.flowKey);
		if(flowModel.attributes)
		{
			for(var key in flowModel.attributes)
			{
				this.attributes.set(key ,flowModel.attributes[key]);
			}
        }
    }

    componentDidMount() 
    {
        

        this.forceUpdate();
    }
    
    //this will be triggered if any leaf is selected
	selectItem(id : string)
	{
		this.selectedItem = id;
		 
		//loop through children telling each to deselect their children
		for(var key in this.refs)
		{
            (this.refs[key] as TreeParentNode).deselectAllChildren();
		}
	}
	
	getSelectedItem()
	{
		return this.selectedItem;
	}
	
	getAttribute(attributeName : string)
	{
		if(this.attributes.has(attributeName))
		{
			return this.attributes.get(attributeName);
		}
		else
		{
			return null;
		}
	}

	
	render()
	{
	   
		const flowModel = manywho.model.getComponent(this.props.id,   this.props.flowKey);
        const flowState = manywho.state.getComponent(this.props.id,   this.props.flowKey);
        
        var styles = new Map<string,string>();
        if(flowModel.width && flowModel.width > 0){	styles.set("width", flowModel.width + "px");}
        if(flowModel.height && flowModel.height > 0){styles.set("height", flowModel.height + "px");}

        //create an array of TreeParentNode classes for the data
        var self = this;
        this.childNodes = flowModel.objectData.map(function(group : any, index : any){
            var groupId = manywho.utils.getObjectDataProperty(group.properties, self.getAttribute("parentKeyAttribute")).contentValue;
            return(
                <TreeParentNode ref={"G_" + groupId} parent={self} group={group} />
            );
        });

        return <div className= "tree-view" style= {styles}>
                <ul className="tree-root"> 
                    {
                        this.childNodes
                    }
                </ul>
            </div>
    }
}

class TreeParentNode extends React.Component<any, any>
{
    childNodes: Array<TreeChildNode> = [];
    expanded : boolean = false;
    parent : TreeView = null;
    queueGroup : any = null;
    
    constructor(props : any)
    {
        super(props);
        this.parent = props.parent;
        this.queueGroup = props.group;

        this.deselectAllChildren = this.deselectAllChildren.bind(this);
        this.toggleExpand = this.toggleExpand.bind(this);
        
        //set default expanded
        this.expanded = this.parent.getAttribute("showExpanded") === "true"? true : false;
    }
    
	componentDidMount() 
	{
	   // this.props.onRef(this)
	}
	
	componentWillUnmount() 
	{
	   // this.props.onRef(undefined)
	}
	
	toggleExpand()
	{
        this.expanded = !this.expanded;
        this.forceUpdate();
	}
	
	deselectAllChildren()
	{
        for(var key in this.refs)
        {
            (this.refs[key] as TreeChildNode).deselect();
        }
	}

	render()
	{
        
		const flowState = manywho.state.getComponent(this.parent.componentId,   this.parent.flowKey);
		const flowModel = manywho.model.getComponent(this.parent.componentId,   this.parent.flowKey);
		
		var items = [];
		var workQueues = [];
		this.childNodes = [];
		
		if(flowState.loading)
		{
			return null;
		}
		else
		{
			//get group name
			var groupName = manywho.utils.getObjectDataProperty(this.queueGroup.properties, this.parent.getAttribute("parentLabelAttribute")).contentValue;
			
			//get queues
			var queues =  manywho.utils.getObjectDataProperty(this.queueGroup.properties, this.parent.getAttribute("parentChildArrayAttribute")).objectData;
            
            var self = this;

   
			if(queues)
			{
                this.childNodes = queues.map(function(queue : any, index : any){
                    var queueId = manywho.utils.getObjectDataProperty(queue.properties, self.parent.getAttribute("parentKeyAttribute")).contentValue;
                    return(
                        <TreeChildNode ref={"Q_" + queueId} parent={self} queue={queue} />
                    );
                });

				
			}
			
			var icon = manywho.utils.getObjectDataProperty(this.queueGroup.properties, this.parent.getAttribute("parentIconAttribute")).contentValue;
			
			if(!icon || icon.length===0)
			{
				icon = this.parent.getAttribute("parentDefaultIcon") || "envelope";
			}
            
            //need to know how many child queues are in group

            var expIcon : any = null;
			if(this.parent.getAttribute("isCollapsible") === "true" && queues.length > 0)
			{
				var expandIcon =  "";
				if( this.expanded === true)
				{
					 expandIcon = this.parent.getAttribute("contractIcon") || "minus-sign"
				}
				else
				{
					expandIcon = this.parent.getAttribute("expandIcon") || "plus-sign";
				}
               expIcon = <span className={"glyphicon glyphicon-" + expandIcon} style={{"padding-right":"10px"}} onClick= {this.toggleExpand} ></span>;
            }
			var queueItems : any = null;
			if( this.expanded === true)
			{
				queueItems = <ul className="tree-leaf">
                {this.childNodes}</ul>;
			}
			
			//<span className={"queue-count"} >{"(" + queues.length + ")"}</span>
            return <li className="tree-root-item">
                {expIcon}
                <span className={"glyphicon glyphicon-" + icon} ></span>
                <span className={"queue-group-label"} >{groupName}</span>
                
                {queueItems}

            </li>;
        }
         
        
    }
}

class TreeChildNode extends React.Component<any, any>
{
    selected : boolean = false;
    parent : TreeParentNode = null;
    queue : any = null;

	constructor(props : any)
	{
		super(props);
        this.parent = props.parent;
        this.queue = props.queue;
        
        this.select = this.select.bind(this);
        this.deselect = this.deselect.bind(this);
		
		var selectedQueueId = this.parent.parent.getSelectedItem();
		this.selected = manywho.utils.getObjectDataProperty(this.queue.properties, this.props.parent.props.parent.getAttribute("childKeyAttribute")).contentValue === selectedQueueId  		 
	}
	
	select() 
	{
		//tell parent to deselect all
		this.parent.parent.selectItem( manywho.utils.getObjectDataProperty(this.queue.properties, this.parent.parent.getAttribute("childKeyAttribute")).contentValue );
		//now set me selected
		this.selected = true;
		
		
		//clone data
		var objectData = JSON.parse(JSON.stringify(this.queue));
		objectData.isSelected = true;
		var newState = {
			objectData: [objectData]
		};
		
		
		//objectData=this.props.data;
		manywho.state.setComponent(this.parent.parent.componentId, newState, this.parent.parent.flowKey, true);
		
		//this.forceUpdate();
		var outcome = manywho.model.getOutcome(this.parent.parent.getAttribute("outcomeIdForSelect"), this.parent.parent.flowKey);
		manywho.component.onOutcome(outcome, null , this.parent.parent.flowKey);
	
	}
	
	deselect() 
	{
	  this.selected = false;
	}

	componentDidMount()
	{
        
		 //it's a complex type object - need to set it from the model to the state to initialize the output otherwise it will be null
		let objectData = null;
		
		const flowModel = manywho.model.getComponent(this.parent.parent.componentId,   this.parent.parent.flowKey);
		const flowState = manywho.state.getComponent(this.parent.parent.componentId,   this.parent.parent.flowKey) || {};

		if (flowState && flowState.objectData && flowState.objectData[0] && flowState.objectData[0].properties)
		{
			objectData = flowState.objectData[0];
		}
		else if (flowModel && flowModel.objectData && flowModel.objectData[0])
		{
			objectData = flowModel.objectData[0];
		}
		
		//manywho.state.setComponent(this.props.parent.props.parent.props.id, {objectData: []}, this.props.parent.props.parent.props.flowKey, true);
		
		//if there's one selected then flag it selected
		
		if(objectData)
		{
			//console.log('selected item');
			//so there is a current queue selected but is it the current one?
			var queueId = manywho.utils.getObjectDataProperty(this.queue.properties, this.parent.parent.getAttribute("childKeyAttribute")).contentValue;
			var selectedQueueId = manywho.utils.getObjectDataProperty(objectData.properties,this.parent.parent.getAttribute("childKeyAttribute")).contentValue;
			
			//console.log('qid=' + queueId);
			///console.log('selected qid=' + selectedQueueId);
			
		
			if(queueId === selectedQueueId)
			{
				this.selected =  true;
			}
		
        }
        
	}

	render()
	{
		const flowState = manywho.state.getComponent(this.parent.parent.componentId,   this.parent.parent.flowKey);
		const flowModel = manywho.model.getComponent(this.parent.parent.componentId,   this.parent.parent.flowKey);
		
		if(flowState.loading)
		{
			return null;
		}
		else
		{
            
			var queueId = manywho.utils.getObjectDataProperty(this.queue.properties, this.parent.parent.getAttribute("childKeyAttribute")).contentValue;
			var queueName = manywho.utils.getObjectDataProperty(this.queue.properties, this.parent.parent.getAttribute("childLabelAttribute")).contentValue;
			var subLabel = manywho.utils.getObjectDataProperty(this.queue.properties, this.parent.parent.getAttribute("childSubLabelAttribute")).contentValue;
			var icon = manywho.utils.getObjectDataProperty(this.queue.properties, this.parent.parent.getAttribute("childIconAttribute")).contentValue;
			
			if(!icon || icon.length===0)
			{
				icon= this.parent.parent.getAttribute("childDefaultIcon") || "tasks";
			}

            var className = this.selected ? 'tree-leaf tree-leaf-selected' : 'tree-leaf';
            
            
            
            //return React.createElement( 'li' , {ref: queueId, "data-queueId": queueId, className: className, onClick: this.select } , items );
            return <li className= {className} onClick={this.select}>
                <span className={'glyphicon glyphicon-' + icon}></span>
                <span className={'queue-label'}>{queueName}</span>
                <span className={'queue-count'}>{"(" + subLabel + ")"}</span>
                </li>;
        }
        
       
	}
}

manywho.component.register('TreeView', TreeView);

export default TreeView;

