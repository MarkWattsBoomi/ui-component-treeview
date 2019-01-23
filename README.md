# Tree View
This component assumes that the source data for the component is a list of values which are each 2 tier

## Data Structures
The tree requires a list of parent objects each of which contains 0-many child objects

Parent Object
{
	id				-	A unique identifier for the parent 			-	int / string / etc
	label			-	The display name for the parent				-	string
	icon			-	The short part of a bootstrap glyph-icon 	-	string e.g. "trash", "wrench"
	children		-	A list of child objects						-	list of type
}

Child Object
{
	id				-	A unique identifier for the child 			-	int / string / etc
	label			-	The display name for the child				-	string
	icon			-	The short part of a bootstrap glyph-icon 	-	string e.g. "trash", "wrench"
	count			-	Some other second level display field		-	int / string / etc
}


# Upload the assets
Upload the js and css files as assets in the tenant.
They should be called TreeView.css & TreeView.js


# Add the custom resources the player

	requires: ['core', 'bootstrap3'],
	customResources: [
            
		'https://s3.amazonaws.com/files-manywho-com/<<your tenant id>>/TreeView.css',
		'https://s3.amazonaws.com/files-manywho-com/<<your tenant id>>/TreeView.js',

            ],


			
# add a component to the form

- Add a component, any type,  to the page
- Set it's name etc
- Set it's data source to a list of the types being passed - in the above example it would be a value which was a list of ParentObject types each containing a list of child object types
- Set the state to be a value which is an instance of the child object type. e.g. "Selected Child Object"
- Edit the page metadata and find the new item, identify it's "componentType": "TreeView",





# set the custom attributes needed on the new component - You need them all !!!!!!!

- expandIcon					plus-sign		the icon to be displayed when a group is collapsed and can be expanded
- contractIcon				minus-sign		the icon to be displayed when a group is expanded and can be collapsed
- showExpanded				true			true or false as to whether the groups should be expanded by default on initial show
- isCollapsible				true			true or false to signify if the groups can be expanded and the buttons to do show should be shown
- childDefaultIcon			trash			the default icon to show on a child if none is explicitly defined on the child object
- childKeyAttribute			rowid			the name of the value on the child type containing the child's unique identifier.  "id" in the example above
- parentDefaultIcon			wrench			the default icon to show on a parent if none is explicitly defined on the parent object
- childIconAttribute			icon			the name of the value on the child type containing the icon for this specific child.  "icon" in the example above
- parentKeyAttribute			RowId			the name of the value on the child type containing the parent's unique identifier.  "id" in the example above
- childLabelAttribute			queue_name		the name of the value on the child type containing the display text for this specific child.  "label" in the example above
- parentIconAttribute			icon			the name of the value on the parent type containing the icon for this specific parent.  "icon" in the example above
- parentLabelAttribute			Group Name		the name of the value on the parent type containing the display text for this specific parent.  "label" in the example above
- childSubLabelAttribute			count			the name of the value on the child type containing the a second display text for this specific child.  "count" in the example above
- parentChildArrayAttribute		Queues			the name of the value on the parent type containing a list of child objects.  "children" in the example above
- outcomeIdForSelect			8e*********6fa3c30	the guid of the outcome to trigger when a child object is selected - this outcome should link straight to an empty operator step and then link straight back to the 								originating page


# OPTIONAL ATTRIBUTES
If you set the width or height of the component it will fix it to those sizes in pixels - otherwise it will set it to 100% of the parent container size.

