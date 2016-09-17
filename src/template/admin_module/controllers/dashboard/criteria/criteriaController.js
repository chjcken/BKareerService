/**
 * Created by trananhgien on 9/7/2016.
 */

define([
  'app',
  'ng-tree',
  'angular-animate',
  'toaster'
], function(app) {
  
  function adminCriteriaController(vm, $timeout, $log, toaster, criteria) {
    console.log("Admin Criteria Controller");
    vm.parentNodes = [];
    var MAX_LEVEL = 4;
    var INPUT_TYPE = {'text': 0, 'number': 1, 'email': 2, 'radio': 3, 'checkbox': 4, 'location': 5}
    var newId = 6, selectedNode;

    var treeConfig = {
      core : {
        multiple : true,
        animation: true,
        error : function(error) {
            $log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
        },
        check_callback : true,
        worker : true
      },
      types : {
        default : {
            icon : 'glyphicon glyphicon-flash'
        },
        title : {
            icon : 'glyphicon glyphicon-menu-down'
        },
        text : {
            icon : 'fa fa-text-height'
        },
        number : {
            icon : 'fa fa-sort-numeric-asc'
        },
        email : {
            icon : 'fa fa-envelope'
        },
        radio : {
            icon : 'fa fa-check-circle'
        },
        checkbox : {
            icon : 'fa fa-list'
        },
        location: {
          icon: 'fa fa-map-marker'
        }
      },
      checkbox: {
        whole_node: false,
        keep_selected_style: true
      },
      version : 1,
      plugins : ['types','checkbox']
    };


    vm.readyCB = function() {
      $timeout(function() {
        console.log('success', 'JS Tree Ready', 'Js Tree issued the ready event');
      });
    };

    vm.createNodeCB  = function(e,item) {
      console.log("createNodeCB", item.node);

      vm.treeInstance.jstree().open_node(item.node.parent);
      vm.treeData = vm.treeInstance.jstree().get_json("#", {flat: true});
      reset();
      console.log("----TreeData---->", vm.treeData);
      $timeout(function() {console.log('success', 'Node Added', 'Added new node with the text ' + item.node.text)});
    };

    vm.checkNodeCB = function(e, item) {
      vm.selectedNodes = getSeletedNode();
      vm.selectedNode = item.node;
      console.log("selectedNode", vm.selectedNode);
      // create propably parent nodes
      var childNodes = vm.treeInstance.jstree().get_json(vm.selectedNode.id, {flat: true});
      vm.parentNodes = generateParentNodes(vm.selectedNode.type);
      console.log("parentNodes", vm.parentNodes);
      angular.copy(vm.selectedNode, vm.newNode);
    };

    vm.uncheckNodeCB = function(e, item) {
      vm.selectedNodes = getSeletedNode();
      reset();
    };

    vm.deleteNodes = function() {
      vm.treeInstance.jstree().delete_node(vm.selectedNodes);
      vm.treeData = vm.treeInstance.jstree().get_json("#", {flat: true});
      console.log("----TreeData----->", vm.treeData);
      reset();
    };

    vm.addNewNode = function(newNode) {
      console.log("----addNewNode--->", newNode);
      if (!validate()) return;
      if (newNode.type != 'title') {
        console.log("set is last");
        newNode.data.is_last = true;
      }

      vm.treeInstance.jstree().create_node(newNode.parent,
        {id: (newId++).toString(), text: newNode.text, type: newNode.type, data: newNode.data},
        'last');
    };

    vm.updateNode = function(newNode) {
      if (!validate()) return;
      var currentNode = vm.selectedNode;

      currentNode.text = newNode.text;
      currentNode.type = newNode.type;
      currentNode.icon = treeConfig.types[newNode.type].icon;
      currentNode.data = newNode.data;
      console.log("-----update node----->", newNode);
      vm.treeInstance.jstree().deselect_node(currentNode);
      vm.treeInstance.jstree().redraw(currentNode);
      vm.treeData = vm.treeInstance.jstree().get_json("#", {flat: true});
      reset();
      console.log("-----TreeData----->", vm.treeData);
    }

    function validate() {
      var newNode = vm.newNode;
      if (newNode.text == '') {
        toaster.pop('error', 'Error', 'Missing title');
        return false;
      }

      if (newNode.type == '') {
        toaster.pop('error', 'Error', 'Missing type of value');
        return false;
      }

      if (newNode.type == 'radio' || newNode.type == 'checkbox') {
        if (newNode.data.options.length == 0) {
          toaster.pop('error', 'Error', 'Missing options');
          return false;
        }
      }

      var level = vm.treeInstance.jstree().get_path(newNode.parent).length;
      if (level >= MAX_LEVEL) {
        toaster.pop('error', 'Error', 'The deph must be <= 4 level');
        return false;
      }

      var parentNode = vm.treeInstance.jstree().get_node(newNode.parent);
      console.log("validate", parentNode);
      if ( newNode.type == 'title' && (parentNode.data && parentNode.data.is_last) ){
        toaster.pop('error', 'Error', 'The node parent "' + parentNode.text + '" is last node');
        return false;
      }


      if (newNode.type != 'title' && parentNode.type != 'title') {
        toaster.pop('error', 'Error', 'Parent node must have type is "title"');
        return false;
      }

      return true;
    }

    function getSeletedNode() {
      return vm.treeInstance.jstree(true).get_checked(true);
    }

    function generateParentNodes() {
      var result = [], parentNodes;
      parentNodes = vm.treeData;

      for (var i = 0; i < parentNodes.length; i++) {
        if (parentNodes[i].type == 'title') {
          result.push(parentNodes[i]);
        }
      }

      return result;
    }

    function generateCriterias() {
      var tree = vm.treeInstance.jstree().get_json("#", {flat: false});
      console.log("----Tree----->", tree);
      var root = {text: "root", children: tree, isTemp: true};
      root = recursive(root);
      console.log("level", vm.treeInstance.jstree().get_path(root).length + 1);
      console.log("Criteria", root);
      return root.data;
    }

    function recursive(node) {
      var newNode = {name: node.text};
      if (node.data && node.data.is_last) {
        newNode.is_last = true;
        var options = node.data.options;
        if (options && options.length > 0) {
          console.log("has options");
          newNode.data = [];
          for (var i = 0; i < options.length; i++) {
            var optionNode = {
              name: options[i].name,
              value_type: INPUT_TYPE[node.type]
            };
            newNode.data.push(optionNode);
          }
        } else {
          newNode.data = [{
            name: "{{no_title}}",
            value_type: INPUT_TYPE[node.type]
          }];

        }

        return newNode;
      }

      newNode.data = [];
      for (var i = 0; i < node.children.length; i++) {
        newNode.data.push(recursive(node.children[i]));
      }

      return newNode;
    }

    function addOption(opt, toArray) {
      console.log("----addOption--->", opt, toArray);
      if (toArray.indexOf(opt) > -1) {
        return;
      }

      toArray.push({name: opt});
      vm.option = '';
      console.log("----addOption--->", opt, toArray);
    }

    function removeOption(opt, fromArray) {
      var index = fromArray.indexOf(opt);
      if (index == -1) return;
      fromArray.splice(index, 1);
    }

    function changeType(newType) {
      if (newType == 'checkbox' || newType == 'radio') {
        if (!vm.newNode.data) {
          vm.newNode.data = {options: []};
        }
      }

      vm.parentNodes = generateParentNodes(newType);
    }

    function reset() {
      vm.selectedNodes = [];
      vm.selectedNode = null;
      vm.parentNodes = generateParentNodes();
      vm.newNode = {text: '', parent: "#", type: "", data: {options: []}};
    }

    function log(obj) {
      console.log(vm.newNode.data);
    }

    vm.treeData = [
      { id : '1', parent : '#', text : 'Basic Skills', state: { opened: true}, type: "title", data: {} },
      { id : '2', parent : '#', text : 'Invidual Infor', state: { opened: true}, type: "title", data: {} },
      { id : '3', parent : '2', text : 'Age', state: { opened: true}, type: "number", data: {is_last: true}},
      { id : '4', parent : '1', text : 'Toeic', state: { opened: true}, type: "number", data: {is_last: true}},
      { id : '5', parent : '1', text : 'Toefl', state: { opened: true}, type: "number", data: {is_last: true}}
    ];

    vm.addOption = addOption;
    vm.removeOption = removeOption;
    vm.changeType = changeType;
    vm.save = function() {
      var arrCriterias = generateCriterias();
      console.log("criteria", arrCriterias);
      criteria.addCriteria(arrCriterias).then(function(res) {
        console.log("addCriteria", res);
        
      });
    };
    vm.log = log;
    vm.treeConfig = treeConfig;
    criteria.getAllCriteria().then(function(r) {
          console.log("get", r);
        });
    $timeout(reset, 1000);
  }

  adminCriteriaController.$inject = ['$scope', '$timeout', '$log', 'toaster', 'criteria'];
  app.controller('adminCriteriaController', adminCriteriaController);

  return adminCriteriaController;

});
