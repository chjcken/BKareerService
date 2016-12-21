/**
 * Created by trananhgien on 9/7/2016.
 */

define([
  'app',
  'ng-tree',
  'angular-animate',
  'toaster'
], function(app) {
  
  function adminCriteriaController(vm, $timeout, $log, toaster, criteria, $http) {
    console.log("Admin Criteria Controller");
    vm.parentNodes = [];
    var MAX_LEVEL = 4;
    var INPUT_TYPE = {'text': 0, 'number': 1, 'email': 2, 'radio': 3, 'checkbox': 4, 'location': 5}
    var INPUT_TYPE_NAME = Object.keys(INPUT_TYPE);
    var newId = 0, selectedNode;
    var addTitleList = [], updateValueList = [], addValueList = [];
    
    var treeConfig = {
      core : {
        multiple : false,
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
      var nodeType = vm.selectedNode.type;
      vm.isShowPriority = nodeType != 'title' && nodeType != 'radio' && nodeType != 'checkbox';
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
      console.log("--delete node-->", vm.selectedNodes);
      var node = vm.selectedNodes[0];
      criteria.deleteCriteria(node.data.id)
        .then(function(res) {
          if (res.data.success === 0) {
            vm.treeInstance.jstree().delete_node(node);
            vm.treeData = vm.treeInstance.jstree().get_json("#", {flat: true});
            return toaster.pop('success','Success', 'Delete Criteria ' + node.text);
          }
          
          toaster.pop('error', 'Error', 'Oops! Something went wrong');
        });
      reset();
    };

    vm.addNewNode = function(newNode) {
      console.log("----addNewNode--->", newNode);
      if (!validate()) return;
      if (newNode.type != 'title') {
        console.log("set is last");
        newNode.data.is_last = true;
      } else {
        delete newNode.data.weight;
      }

      vm.treeInstance.jstree().create_node(newNode.parent,
        {id: (++newId).toString(), text: newNode.text, type: newNode.type, data: newNode.data},
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
      parentNodes = vm.treeInstance.jstree().get_json("#", {flat: true});
      
      for (var i = 0; i < parentNodes.length; i++) {
        if (parentNodes[i].type == 'title') {
          result.push(parentNodes[i]);
        }
      }

      return result;
    }
    
    function convertToTreeData(criterias) {
      var root = {
        name: "root",
        data: criterias
      };
      
      var treeData = recursiveTreeData(root, "", 0);
      return treeData;
    }
    
    var newId = 1;
    function recursiveTreeData(node, pid) {
      newId++;
      var newNode = {id: newId, text: node.name, state: {opened: true}, type: 'title',
      data: {
        id: node.id
      }, children: []};
      
      if (node.is_last) {
        newNode.data.is_last = true;
        var child = node.data[0];
        newNode.type = INPUT_TYPE_NAME[child.value_type];
        
        if (child.value_type == INPUT_TYPE.radio || child.value_type == INPUT_TYPE.checkbox) {
          newNode.data.options = [];
          for (var i = 0; i < node.data.length; i++) {
            newNode.data.options.push({
              value_id: node.data[i].id,
              name: node.data[i].name,
              weight: node.data[i].weight
            });
          }
        } else {
          newNode.data.weight = child.weight;
          newNode.data.value_id = child.id;
        }
        return newNode;
      } else {
        for (var i = 0; i < node.data.length; i++) {
          newNode.children.push(recursiveTreeData(node.data[i], newId));
        }
      }
      
      return newNode;
    }

    function generateCriterias() {
      var tree = vm.treeInstance.jstree().get_json("#", {flat: false});
      var root = {text: "root", children: tree, isTemp: true};
      root = recursive(root);
      return root.data;
    }

    function recursive(node) {
      var newNode = {name: node.text};
      if (node.data && node.data.id) {
        newNode.id = node.data.id;
      }
      
      if (node.data && node.data.is_last) {
        newNode.is_last = true;
        var options = node.data.options;
        if (options && options.length > 0) {
          newNode.data = [];
          for (var i = 0; i < options.length; i++) {
            var optionNode = {
              name: options[i].name,
              value_type: INPUT_TYPE[node.type],
              weight: Number(options[i].weight)
            };
            if (options[i].value_id) {
              optionNode.id = options[i].value_id;
            }
            newNode.data.push(optionNode);
          }
        } else {
          newNode.data = [{
            name: "{{no_title}}",
            value_type: INPUT_TYPE[node.type],
            weight: Number(node.data.weight)
          }];
          
          if (node.data.value_id) {
            newNode.data[0].id = node.data.value_id;
          }
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

      toArray.push({name: opt.name, weight: opt.weight});
      vm.option = {};
      console.log("----addOption--->", opt, toArray);
    }

    function removeOption(opt, fromArray) {
      console.log("--remove opt-->", opt);
      var index = fromArray.indexOf(opt);
      if (index == -1) return;
      criteria.deleteCriteria(opt.value_id, true)
        .then(function(res) {
          if (res.data.success != 0) {
            return toaster.pop('error', "Error", "Delete criteria value failed");
          }
          
          fromArray.splice(index, 1);
          toaster.pop('success', 'Delete Successfully');
        });
      
    }

    function changeType(newType) {
      if (newType == 'checkbox' || newType == 'radio') {
        if (!vm.newNode.data) {
          vm.newNode.data = {options: []};
        }
      }
      
      console.log("newtype", newType);
      console.log("selected node", vm.selectedNode);
      if (newType != 'title' && newType != "#") {
        vm.isShowPriority = true;
      } else {
        vm.isShowPriority = false;
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

//    vm.treeData = [
//      { id : '1', text : 'Basic Skills', state: { opened: true}, type: "title", data: {},
//        children: [{ id : '4', text : 'Toeic', state: { opened: true}, type: "number", data: {is_last: true}},
//        { id : '5', text : 'Toefl', state: { opened: true}, type: "number", data: {is_last: true}}]
//      },
//      { id : '2', parent : '#', text : 'Invidual Infor', state: { opened: true}, type: "title", data: {},
//        children: [{ id : '3', text : 'Age', state: { opened: true}, type: "number", data: {is_last: true}}]
//      }
//    ];

    vm.addOption = addOption;
    vm.removeOption = removeOption;
    vm.changeType = changeType;
    vm.isShowPriority = true;
    
    vm.save = function() {
      var arrCriterias = generateCriterias();
      console.log("criteria", arrCriterias);
      criteria.addCriteria(arrCriterias).then(function(res) {
        console.log("addCriteria", res);
      });
    };
    
    vm.get = function() {
      criteria.getAllCriterias().then(function(res) {
        console.log("get", res);
        var treeData = convertToTreeData(res.data.data).children;
        console.log("convertToTreeData", treeData);
        vm.treeData = treeData;
        vm.treeConfig.core.data = treeData;
//        $timeout(reset, 1000);
      });
    };
    
    vm.truncate = function(table) {
      $http.post("/api", {table: table}, {params: {q: "truncatetable"}})
       .then(function(res) {
         alert(res.data.success);
       });
    };
    
    vm.reset = reset;
    vm.log = log;
    vm.treeConfig = treeConfig;
    
    vm.treeData = [];
    
    vm.get();
  }

  adminCriteriaController.$inject = ['$scope', '$timeout', '$log', 'toaster', 'criteria', '$http'];
  app.controller('adminCriteriaController', adminCriteriaController);

  return adminCriteriaController;

});
