(function($) {
    
    /*
     * This widget converts ul/li tree to tree that allows to expand/collapse its branches.
     * It creates links with 'onclick' events, when user click on these links, branches
     * will be expanded (if it is collapsed) or collapsed (if it is expanded).
     * 
     * == xHTML Format of tree
     * 
     * With root:
     * 
     * <div class="treeview">
     *   <!-- Expand/Collapse link will be placed here. Like: -->
     *   <!-- <a href="#" class="expand tree-handler">+</a> -->
     *   <div>Root</div>
     *   <ul>
     *     <li>
     *       <!-- Expand/Collapse link will be placed here -->
     *       <div>...something here, name of branch, links, inputs, etc.</div>
     *       <ul>
     *         <!-- Expand/Collapse link will be placed here -->
     *         <div>...somenthing here...</div>
     *         <li>...and so on</li>
     *       </ul>
     *     </li>
     *     <li>...and so on</li>
     *   </ul>
     * </div>
     * 
     * Without root:
     * 
     * <div class="treeview">
     *   <ul>
     *     <li>
     *       <!-- Expand/Collapse link will be placed here -->
     *       <div>...something here, name of branch, links, inputs, etc.</div>
     *       <ul>
     *         <!-- Expand/Collapse link will be placed here -->
     *         <div>...somenthing here...</div>
     *         <li>...and so on</li>
     *       </ul>
     *     </li>
     *     <li>...and so on</li>
     *   </ul>
     * </div>
     * 
     * 
     * == Using
     * 
     * // Initialize tree, creates links and collapse all branches
     * $('.treeview').tree(); 
     * 
     * // Expand some branch
     * $('.treeview').tree('expand', ul); // ul is jQuery object
     * $('.treeview').tree('expand', ul, 'slide'); // use slideDown() instead of show() 
     * $('.treeview').tree('expand', 'ul#branch'); 
     * 
     * // Collapse some branch
     * $('.treeview').tree('collapse', ul); // ul is jQuery object
     * $('.treeview').tree('collapse', ul, 'slide'); // use slideUp() instead of hide()
     * $('.treeview').tree('collapse', 'ul#branch');
     * 
     * // Update the tree (if your scripts changed structure of the tree)
     * $('.treeview').tree('update'); 
     * 
     * // Getter method, returns true if branch is collapsed
     * $('.treeview').tree('is_collapsed', ul); // ul is jQuery object 
     * $('.treeview').tree('is_collapsed', 'ul#branch');
     * 
     * 
     * == Options
     * 
     * 1. 'expand_char' - Character that will be used for expanding link. Default is &rarr; - right arrow.
     * 2. 'collapse_char' - Character that will be used for expanding link. Default is &uarr; - up arrow.
     * 3. 'collapse_after_init' - Collapse all branches after initialization. Default is true.
     * 4. 'add_expand_all' - Add 'Expand All' link that expands all branches before the tree. Default is true.
     * 5. 'add_collapse_all' - Add 'Collapse All' link that collapses all branches before the tree. Default is true.
     * 6. 'expand_all_text' - Text that 'Expand All' link will contain. Default is 'Expand All'.
     * 7. 'collapse_all_text' - Text that 'Collapse All' link will contain. Default is 'Collapse All'.
     * 8. 'collapse_after_init' - Collapse all tree after initialization. Default is true.
     * 9. 'handle_for_dragging' - Selector for handle for dragging. This element should be contained in
     *    <div></div> section. Default is null. If this parameter is null, then drag'n'drop will be disabled. 
     *    Example:
     *    
     *    <div class="treeview">
     *      <ul>
     *        <li>
     *          <!-- Expand/Collapse link will be placed here -->
     *          <div><span class="name">My Element</span></div>
     *        </li>
     *        <li>...</li>
     *      </ul>
     *    </div>
     *    
     *    <script type="text/javascript"> $('.treeview').tree({handle_for_dragging: 'span.name'}); </script>
     *    
     *    Then user will be able to drag branch by dragging 'My Element' text.
     * 
     * 
     * == Callbacks
     * 
     * 1. expand - function(event, branch)
     * 2. collapse - function(event, branch)
     * 
     * It will be called when user expand/collapse some branch (not all branches). Argument 'branch' contains
     * jquery object with <ul> DOM element that was expanded/collapsed.
     * 
     * 3. expand_all - function(event, tree)
     * 4. collapse_all - function(event, tree)
     * 
     * It will be called when user expand/collapse all branches (by 'Expand/Collapse All').
     * Argument 'tree' contains jquery object of current tree (this.element)
     * 
     * 5. drop - function(event, ui)
     * 
     * It will be called when user drags some branch and drops it to another branch.
     * Argument 'ui' is a hash. 
     * ui.draggable contains <li> element that was dragged.
     * ui.droppable contains <li> element where ui.draggable was dropped.
     * 
     */
    
    var expand_link_class = 'ui-tree-expand';
    var collapse_link_class = 'ui-tree-collapse';
    var common_link_class = 'ui-tree-handler'
    var expand_all_link_class = 'ui-tree-expand-all';
    var collapse_all_link_class = 'ui-tree-collapse-all';
    var draggable_over_class = 'ui-tree-draggable-over';

    
    $.widget("ui.tree", {
        _init: function() {
            var widget = this;
            widget._set_with_root_option();

            if(widget.options.collapse_after_init) { 
                // Hide all branches
                $('ul', widget.element).hide();
                // Show first (root) branch
                widget._parent().children('ul').show();
            }

            // Create links - tree handlers for collapsing/expanding branches
            widget._build_tree_handlers();

            if(widget.options.add_collapse_all) { widget._add_collapse_all_link(widget.element); }
            if(widget.options.add_expand_all) { widget._add_expand_all_link(widget.element); }
            if(widget.options.handle_for_dragging) { widget._init_drag_n_drop(); }
        },
        
        // Expand given branch. Attribute 'branch' can be selector or jQuery object
        expand: function(branch, method) {
            method = method || 'instant'
            branch = branch.jquery ? branch : $(branch, this.element);
            if(method == 'instant') {
              branch.show();
            } else if(method == 'slide') {
              branch.slideDown();
            }
            var a = branch.siblings('div').children('.' + expand_link_class);
            this._set_link_to_collapse(a);
            this._trigger('expand', 0, branch)
        },
        
        // Collapse given branch. Attribute 'branch' can be selector or jQuery object
        collapse: function(branch, method) {
            method = method || 'instant'
            branch = branch.jquery ? branch : $(branch, this.element);
            if(method == 'instant') {
              branch.hide();
            } else if(method == 'slide') {
              branch.slideUp();
            }
            var a = branch.siblings('div').children('.' + collapse_link_class);
            this._set_link_to_expand(a);
            this._trigger('collapse', 0, branch)
        },
        
        // Rebuild all tree handlers links
        update: function() {
            this._build_tree_handlers();
        },
        
        // Return true if branch is collapsed. Attribute 'branch' can be selector or jQuery object
        is_collapsed: function(branch) {
            branch = branch.jquery ? branch : $(branch, this.element);
            return (branch.get(0).style.display == 'none');
        },
        
        _add_collapse_all_link: function() {
            var widget = this;
            var a_collapse_all = $('<a class="' + collapse_all_link_class + '" href="#">' + widget.options.collapse_all_text + '</a>');
            this.element.before(a_collapse_all);
            a_collapse_all.click(function() { 
                $('ul', widget.element).hide();
                if(!widget.options.with_root) { widget.element.children('ul').show(); };
                widget.update();
                widget._trigger('collapse_all', 0, widget.element);
                return false;
            });
        },

        _add_expand_all_link: function() {
            var widget = this;
            var a_expand_all = $('<a class="' + expand_all_link_class + '" href="#">' + widget.options.expand_all_text + '</a>');
            this.element.before(a_expand_all);
            a_expand_all.click(function() { 
                $('ul', widget.element).show(); 
                widget.update();
                widget._trigger('expand_all', 0, widget.element);
                return false;
            });
        },

        _set_link_to_collapse: function(a) {
            a.removeClass(expand_link_class)
            a.addClass(collapse_link_class);
            a.html(this.options.collapse_char);
        },

        _set_link_to_expand: function(a) {
            a.removeClass(collapse_link_class)
            a.addClass(expand_link_class);
            a.html(this.options.expand_char);
        },
        
        _init_drag_n_drop: function() {
            var widget = this;
            
            $('li', widget.element).draggable({
              handle: widget.options.handle_for_dragging + ':first',
              revert: 'invalid',
              cursor: 'move'
            });
            $(widget.options.handle_for_dragging, widget.element).droppable({
              over: function() {
                  $(this).addClass(draggable_over_class);
              },
              tolerance: 'pointer',
              out: function() {
                  $(this).removeClass(draggable_over_class);
              },
              drop: function(event, ui) {
                  $(this).removeClass(draggable_over_class);
                  var li = $(this).closest('li');
                  if(li.size() == 0) { li = widget.element; };
                  var ul = li.children('ul');
                  if(ul.size() == 0) { ul = $('<ul></ul>'); li.append(ul); };
                  ui.draggable.appendTo(ul);
                  ui.draggable.attr('style', 'position: relative');
                  widget.update();
                  widget._trigger('drop', 0, {draggable: ui.draggable, droppable: li});
              }
            });
        },
        
        _parent: function() {
            var parent;
            if(this.options.with_root) {
                parent = this.element.parent();
            } else {
                parent = this.element;
            }
            return parent;
        },

        _set_with_root_option: function() {
            if(this.element.children('div').size() > 0) {
                this.options.with_root = true
            } else {
                this.options.with_root = false
            }
        },

        _build_tree_handlers: function() {
            var widget = this;
            var self = this.element;
            $('ul', self).each(function() {
                var ul = $(this);
                var div = ul.siblings('div');
                
                if(ul.children('li').size() == 0) {
                    div.children('a.' + common_link_class).remove();
                } else {
                    var required_link_class = widget.is_collapsed(ul) ? expand_link_class : collapse_link_class;
                    var a = div.children('a.' + required_link_class);
                    if(a.size() == 0) {
                        div.children('a.' + common_link_class).remove();
                        var character;
                        if(widget.is_collapsed(ul)) {
                            character = widget.options.expand_char;
                        } else {
                            character = widget.options.collapse_char;
                        }
                        a = $('<a href="#" class="' + required_link_class + ' ' + common_link_class + '">' + character + '</a>');
                        div.prepend(a);

                        a.click(function() {
                            widget.is_collapsed(ul) ? widget.expand(ul) : widget.collapse(ul);
                            return false;
                        });
                    }
                }
            });
        }
    });

    $.ui.tree.defaults = {
        expand_char: '&rarr;',
        collapse_char: '&uarr;',
        collapse_after_init: true,
        add_expand_all: true,
        add_collapse_all: true,
        expand_all_text: "Expand All",
        collapse_all_text: "Collapse All"
    };
    
    $.ui.tree.getter = "is_collapsed";
 
})(jQuery);
