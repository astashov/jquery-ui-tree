(function($) {
$(document).ready(function() {

module('Work of Tree');


test("it should expand branche by clicking on expand handler", function() {
	$('#tree').tree({collapse_after_init: true});
	ok($('#tree ul:first').is(':hidden'), 'Subbranch should be hidden before expanding');
	$('a.ui-tree-expand:first').trigger('click');
	ok($('#tree ul:first').is(':visible'), 'Subbranch should be visible after expanding');
	ok($('#tree ul').not(':first').is(':hidden'), 'Other subbranches should be hidden');
});

test("it should collapse branche by clicking on collapse handler", function() {
	$('#tree').tree({collapse_after_init: false});
	ok($('#tree ul:eq(2)').is(':visible'), 'Subbranch should be visible before collapsing');
	$('a.ui-tree-collapse:eq(2)').trigger('click');
	ok($('#tree ul:eq(2)').is(':hidden'), 'Subbranch should be hidden after collapsing');
	ok($('#tree ul:eq(1)').is(':visible'), 'Other subbranches should be visible after collapsing');
});

test("it should expand all branches by clicking on expand all", function() {
	$('#tree').tree({add_expand_all: true});
	ok($('#tree ul').is(':hidden'), 'All subbranches should be hidden before the expanding');
	$('a.ui-tree-expand-all').trigger('click');
	ok($('#tree ul').is(':visible'), 'All subbranches should be visible after expanding all branches');
});

test("it should collapse all branches by clicking on collapse all", function() {
	$('#tree').tree({add_collapse_all: true, add_expand_all: true});
	$('a.ui-tree-expand-all').trigger('click');
	ok($('#tree ul').is(':visible'), 'All subbranches should be hidden before collapsing all branches');
	$('a.ui-tree-collapse-all').trigger('click');
	ok($('#tree ul').is(':hidden'), 'All subbranches should be hidden before collapsing all branches');
});



module("Tree options");

test("it should create tree with default options", function() {
	$('#tree').tree();
	equals($('#tree a.ui-tree-handler').size(), 3, 'Overall number of links-handlers');
	equals($('#tree a.ui-tree-expand').size(), 3, 'Overall number of expand links');
	var links_are_placed_before_div = true;
	$('#tree a.ui-tree-handler').each(function() {
		links_are_placed_before_div = links_are_placed_before_div || $(this).next('div').size() == 1;
	});
	ok(links_are_placed_before_div, 'All links-handlers should be placed before div');
	ok($('#tree > div').is(':visible'), 'Root element should be shown');
	ok($('#tree ul').is(':hidden'), 'All subbranches should be hidden');
	ok($('#tree').siblings('a.ui-tree-expand-all').size() == 1, 'Expand all should be placed by default');
	ok($('#tree').siblings('a.ui-tree-collapse-all').size() == 1, 'Collapse all should be placed by default');
});

test("it should change default characters of handlers", function() {
	$('#tree').tree({expand_char: '+', collapse_char: '-'});
	$('a.ui-tree-expand:first').trigger('click');
	equals($('a.ui-tree-expand:first').text(), '+', "Expand char should be changed");
	equals($('a.ui-tree-collapse:first').text(), '-', "Collapse char should be changed");
});

test("it should expand tree after init", function() {
	$('#tree').tree({collapse_after_init: false});
	ok($('#tree ul').is(':visible'), 'All branches are visible');
});

test("it should collapse tree after init", function() {
	$('#tree').tree({collapse_after_init: true});
	ok($('#tree ul').is(':hidden'), 'All branches are hidden');
});

test("it should add expand all link after init", function() {
	$('#tree').tree({add_expand_all: true});
	ok($('a.ui-tree-expand-all').size() > 0, 'Expand all link are placed');
});
  
test("it should not add expand all link after init", function() {
	$('#tree').tree({add_expand_all: false});
	ok($('a.ui-tree-expand-all').size() == 0, 'Expand all link are not placed');
});

test("it should add collapse all link after init", function() {
	$('#tree').tree({add_collapse_all: true});
	ok($('a.ui-tree-collapse-all').size() > 0, 'Collapse all link are placed');
});
  
test("it should not add collapse all link after init", function() {
	$('#tree').tree({add_collapse_all: false});
	ok($('a.ui-tree-collapse-all').size() == 0, 'Collapse all link are not placed');
});

test("it should change default expand all and collapse all text", function() {
	$('#tree').tree({
		add_expand_all: true, add_collapse_all: true,
		expand_all_text: "Expand all branches", collapse_all_text: "Collapse all branches"
	});
	equals($('a.ui-tree-expand-all').text(), 'Expand all branches', 'Expand all text should be changed');
	equals($('a.ui-tree-collapse-all').text(), 'Collapse all branches', 'Collapse all text should be changed');
}); 


module("Root");

test("it should collapse all branches except root for tree with root", function() {
	$('#tree').tree({collapse_after_init: true});
	ok($('#tree ul').is(':hidden'), 'All branches are hidden');
	ok($('a.ui-tree-handler:first').is(':visible'), 'First handler is visible');
	ok($('a.ui-tree-handler').not(':first').is(':hidden'), 'Other handlers are hidden');
});

test("it should collapse all branches except first level for tree without root", function() {
	$('#tree2').tree({collapse_after_init: true});
	ok($('#tree2 ul:first').is(':visible'), 'First branch is visible');
	ok($('#tree2 ul').not(':first').is(':hidden'), 'Other branches are hidden');
	ok($('a.ui-tree-handler:first').is(':visible'), 'First handler is visible');
	ok($('a.ui-tree-handler').not(':first').is(':hidden'), 'Other handlers are hidden');
});


module("Drag'n'drop");

test("it should move branch to another branch by drag'n'drop", function() {
	$('#tree').tree({collapse_after_init: false, handle_for_dragging: 'span.name'});
	drag({from: 'Juice', to: 'Car'});
	var li = $("#tree span.name:contains('Car')").closest('li');
	equals($('span.name:eq(1)', li).text(), 'Juice', 'Branch should be moved');
	equals($('span.name:eq(2)', li).text(), 'Meat', 'Subbranch should be moved too');
});

test("it should not move branch if target wasn't selected", function() {
	$('#tree').tree({collapse_after_init: false, handle_for_dragging: 'span.name'});
	$("#tree span.name:contains('Meat')").simulate("drag", {dx: 200, dy: 200});
	var el = $("#tree span.name:contains('Meat')").closest('li').parent().closest('li').children('div').children('span.name');
	equals(el.text(), 'Juice', "Branch should not be moved");
});



module("Callbacks");

test("it should run callback after expanding a branch", function() {
	$('#tree').tree({expand: function(event, branch) {
		$('#text').text(branch.siblings('div').children('span.name').text() + ' expand');
	}});
	$('#tree a.ui-tree-handler:first').trigger('click');
	equals($('#text').text(), 'Root expand', 'Callback should be run');
});

test("it should run callback after collapsing a branch", function() {
	$('#tree').tree({collapse_after_init: false, collapse: function(event, branch) {
		$('#text').text(branch.siblings('div').children('span.name').text() + ' collapse');
	}});
	$('#tree a.ui-tree-handler:first').trigger('click');
	equals($('#text').text(), 'Root collapse', 'Callback should be run');
});

test("it should run callback after dragging a branch", function() {
	$('#tree').tree({
		collapse_after_init: false,
		handle_for_dragging: 'span.name',
		drop: function(event, ui) {
			$('#text').text(ui.draggable.children('div').children('span.name').text() +
				' was dropped on ' +
				ui.droppable.children('div').children('span.name').text());
		}
	});
	drag({from: 'Meat', to: 'Car'});
	equals($('#text').text(), 'Meat was dropped on Car', 'Callback should be run');
});


function drag(options) {
	from = $("#tree span.name:contains('" + options.from + "')");
	to = $("#tree span.name:contains('" + options.to + "')");
	offset = {left: to.offset().left - from.offset().left, top: to.offset().top - from.offset().top};
	from.simulate("drag", {dx: offset.left, dy: offset.top});
};

});

})(jQuery);
