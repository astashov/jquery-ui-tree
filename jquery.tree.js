(function($) {

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


		expand: function(branch, method) {
			method = method || 'instant'
			branch = branch.jquery ? branch : $(branch, this.element);

			// Expand branch
			this._expand(branch, method);
			// Set handler to collapse
			var a = branch.siblings('div').children('.' + expand_link_class);
			this._set_link_to_collapse(a);

			this._trigger('expand', 0, branch)
		},


		collapse: function(branch, method) {
			method = method || 'instant'
			branch = branch.jquery ? branch : $(branch, this.element);

			// Collapse branch
			this._collapse(branch, method);

			// Set handler to expand
			var a = branch.siblings('div').children('.' + collapse_link_class);
			this._set_link_to_expand(a);

			this._trigger('collapse', 0, branch)
		},


		update: function() {
			this._build_tree_handlers();
		},


		is_collapsed: function(branch) {
			branch = branch.jquery ? branch : $(branch, this.element);
			return branch.is(':hidden');
		},


		_add_collapse_all_link: function() {
			var widget = this;
			var a_collapse_all = $('<a class="' + collapse_all_link_class + '" href="#">' + widget.options.collapse_all_text + '</a>');
			this.element.before(a_collapse_all);
			a_collapse_all.click(function() { 
				$('ul', widget.element).hide();
				// If tree is without root, top-level branches should be shown
				if(!widget.options.with_root) { widget.element.children('ul').show(); };
				// Rebuild handlers - set them to expand
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
				// Rebuild handlers - set them to collapse
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


		_expand: function(branch, method) {
			if(method == 'instant') {
				branch.show();
			} else if(method == 'slide') {
				branch.slideDown();
			}
		},


		_collapse: function(branch, method) {
			if(method == 'instant') {
				branch.hide();
			} else if(method == 'slide') {
				branch.slideUp();
			}
		},


		_init_drag_n_drop: function() {
			var widget = this;

			// Add draggable widget
			var draggable_options = {};
			draggable_options.handle = widget.options.handle_for_dragging + ':first';
			draggable_options.cursor = 'move';

			// For Opera, 'revert' option should not be used (because it works wrong in Opera),
			// instead of this, draggable object should be returned to its place if it
			// is not dropped on other branch (returned by setting attrbibute style='position:relative')
			if($.browser.opera) {
				draggable_options.stop = function(event, ui) {
					ui.helper.attr('style', 'position: relative');
				}
			} else {
				draggable_options.revert = 'invalid';
			}
			$('li', widget.element).draggable(draggable_options);

			// Add droppable widget
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

					// For tree with root, if parent li is not found, then droppable object is root. 
					if(li.size() == 0) { li = widget.element; };

					var ul = li.children('ul');
					// If subbranch of droppable doesn't exist, create it.
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
			// Tree will be with root if it has 'div' before branches. This 'div'
			// will be root.
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
					// Remove handlers from branch if the branch doesn't have subbranches
					div.children('a.' + common_link_class).remove();
				} else {
					var required_link_class = widget.is_collapsed(ul) ? expand_link_class : collapse_link_class;
					var a = div.children('a.' + required_link_class);
					// If expanded branch doesn't have collapse handler or collapsed branch doesn't
					// have expand handler, create them.
					if(a.size() == 0) {
						// but before this we should destroy any wrong handlers, if they are presented
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
