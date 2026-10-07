/* Rfaheya admin UI: media pickers, note pickers, accord chips, product search. */
jQuery(function ($) {
  var cfg = window.rfaheyaAdmin || { notes: [] };
  var library = cfg.notes || [];
  var iconOf = function (name) {
    var k = String(name).trim().toLowerCase();
    for (var i = 0; i < library.length; i++) if (library[i].name.toLowerCase() === k) return library[i].icon;
    return '';
  };
  var split = function (v) {
    return String(v || '').split(/[,\n]+/).map(function (s) { return s.trim(); }).filter(Boolean);
  };
  var esc = function (s) { return $('<div>').text(s).html(); };

  // ---- media pickers (image or video)
  $(document).on('click', '.rfaheya-media', function (e) {
    e.preventDefault();
    var id = $(this).data('target');
    var type = $(this).data('type') || 'image';
    var frame = wp.media({ title: type === 'video' ? 'Choose video' : 'Choose image', multiple: false, library: { type: type } });
    frame.on('select', function () {
      var a = frame.state().get('selection').first().toJSON();
      $('#' + id).val(a.id);
      $('#' + id + '-preview').html(
        type === 'video'
          ? '<video src="' + a.url + '" muted playsinline autoplay loop></video>'
          : '<img src="' + (a.sizes && a.sizes.medium ? a.sizes.medium.url : a.url) + '" alt="">'
      );
    });
    frame.open();
  });
  $(document).on('click', '.rfaheya-media-clear', function (e) {
    e.preventDefault();
    var id = $(this).data('target');
    $('#' + id).val('');
    $('#' + id + '-preview').empty();
  });
  // New term form: clear the icon after "Add note".
  $(document).ajaxComplete(function (e, xhr, opts) {
    if (opts && opts.data && String(opts.data).indexOf('action=add-tag') !== -1) {
      $('#rfaheya-note-icon').val('');
      $('#rfaheya-note-icon-preview').empty();
    }
  });

  // ---- chips with drag to reorder (shared by notes and accords)
  function chipBox($wrap, $input, opts) {
    var values = split($input.val());
    var $box = $('<div class="rf-chipbox"></div>');
    $input.attr('type', 'hidden').after($box);
    var dragFrom = null;

    function save() { $input.val(values.join(', ')).trigger('change'); }
    function render() {
      $box.empty();
      values.forEach(function (v, i) {
        var icon = opts.icons ? iconOf(v) : '';
        var $chip = $('<span class="rf-chip" draggable="true"></span>').toggleClass('no-icon', !icon);
        if (icon) $chip.append($('<img alt="">').attr('src', icon));
        $chip.append($('<span></span>').text(v));
        $chip.append($('<button type="button" aria-label="Remove">×</button>').on('click', function () { values.splice(i, 1); save(); render(); opts.onChange && opts.onChange(); }));
        $chip.on('dragstart', function () { dragFrom = i; $chip.addClass('dragging'); });
        $chip.on('dragend', function () { $chip.removeClass('dragging'); });
        $chip.on('dragover', function (e) { e.preventDefault(); });
        $chip.on('drop', function (e) {
          e.preventDefault();
          if (dragFrom === null || dragFrom === i) return;
          var moved = values.splice(dragFrom, 1)[0];
          values.splice(i, 0, moved);
          dragFrom = null; save(); render();
        });
        $box.append($chip);
      });
      opts.after && opts.after($box);
    }
    var api = {
      has: function (v) { return values.some(function (x) { return x.toLowerCase() === v.toLowerCase(); }); },
      toggle: function (v) {
        var i = values.findIndex(function (x) { return x.toLowerCase() === v.toLowerCase(); });
        if (i >= 0) values.splice(i, 1); else values.push(v);
        save(); render();
      },
      add: function (v) { if (v && !api.has(v)) { values.push(v); save(); render(); } },
      render: render,
    };
    render();
    return api;
  }

  // ---- note pickers
  $('.rf-notes').each(function () {
    var $wrap = $(this);
    var $input = $wrap.find('.rf-notes-value');
    var hint = $wrap.data('hint');
    var $pop = $('<div class="rf-pop" hidden><input type="search" placeholder="Search notes…"><div class="rf-grid"></div><div class="rf-pop-foot"><span class="rf-pop-msg"></span><span><a target="_blank" rel="noopener">Add notes &amp; icons ↗</a> &nbsp; <button type="button" class="button button-small rf-done">Done</button></span></div></div>');
    $pop.find('a').attr('href', cfg.notesUrl);
    var picker;
    function grid() {
      var q = $pop.find('input[type=search]').val().trim().toLowerCase();
      var $g = $pop.find('.rf-grid').empty();
      var list = library.filter(function (n) { return !q || n.name.toLowerCase().indexOf(q) !== -1; });
      list.forEach(function (n) {
        var $t = $('<button type="button" class="rf-tile"></button>').toggleClass('on', picker.has(n.name));
        $t.append(n.icon ? $('<img alt="">').attr('src', n.icon) : $('<span class="rf-noimg">✦</span>'));
        $t.append($('<span></span>').text(n.name));
        $t.on('click', function () { picker.toggle(n.name); grid(); });
        $g.append($t);
      });
      var exact = library.some(function (n) { return n.name.toLowerCase() === q; });
      var $msg = $pop.find('.rf-pop-msg').empty();
      if (q && !exact) {
        $msg.append($('<button type="button" class="button button-small"></button>').text('Use “' + $pop.find('input[type=search]').val().trim() + '”').on('click', function () {
          picker.add($pop.find('input[type=search]').val().trim());
          $pop.find('input[type=search]').val('');
          grid();
        }));
      } else if (!library.length) {
        $msg.text('No notes in the library yet.');
      }
    }
    picker = chipBox($wrap, $input, {
      icons: true,
      after: function ($box) {
        $box.append($('<button type="button" class="rf-add">+ Add note</button>').on('click', function () {
          $('.rf-pop').not($pop).attr('hidden', true);
          $pop.attr('hidden', !$pop.attr('hidden') ? true : null);
          if (!$pop.attr('hidden')) { grid(); $pop.find('input[type=search]').trigger('focus'); }
        }));
        if (hint) $box.append($('<span class="rf-hint"></span>').text(hint));
        if ($pop && $pop.is(':visible')) grid();
      },
    });
    $wrap.append($pop);
    $pop.find('input[type=search]').on('input', grid).on('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); var first = $pop.find('.rf-tile').first(); if (first.length) first.trigger('click'); else $pop.find('.rf-pop-msg button').trigger('click'); }
      if (e.key === 'Escape') $pop.attr('hidden', true);
    });
    $pop.find('.rf-done').on('click', function () { $pop.attr('hidden', true); });
  });

  // ---- accords: type and press Enter
  $('.rf-tags').each(function () {
    var $wrap = $(this);
    var $input = $wrap.find('.rf-tags-value');
    var placeholder = $input.attr('placeholder');
    var tags = chipBox($wrap, $input, {
      icons: false,
      after: function ($box) {
        var $t = $('<input type="text" class="rf-chip-input">').attr('placeholder', 'Type an accord and press Enter' + (placeholder ? ' — e.g. ' + placeholder : ''));
        $t.on('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            split($t.val()).forEach(function (v) { tags.add(v); });
            $wrap.find('.rf-chip-input').trigger('focus');
          }
        }).on('blur', function () { split($t.val()).forEach(function (v) { tags.add(v); }); });
        $box.append($t);
      },
    });
  });

  // ---- videos: product search
  $('.rf-product-search').on('input', function () {
    var q = $(this).val().trim().toLowerCase();
    $('.rf-product').each(function () { $(this).toggle(!q || String($(this).data('name')).indexOf(q) !== -1); });
  });
});
