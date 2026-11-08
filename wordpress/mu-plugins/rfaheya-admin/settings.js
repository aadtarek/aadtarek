/* Rfaheya Store settings: tabs, image pickers, switches and the live logo preview. */
jQuery(function ($) {
  var $page = $('.rfs')
  if (!$page.length) return

  // Tabs without reloading; the address keeps the tab so a refresh stays on it.
  $page.on('click', '.rfs-nav a', function (e) {
    e.preventDefault()
    var tab = $(this).data('tab')
    $('.rfs-nav a').removeClass('is-active')
    $(this).addClass('is-active')
    $('.rfs-panel').attr('hidden', true)
    $('.rfs-panel[data-panel="' + tab + '"]').removeAttr('hidden')
    $('.rfs-panel[data-panel="tools-extra"]').attr('hidden', tab !== 'tools')
    $('.rfs-savebar').attr('hidden', tab === 'tools')
    $('input[name="rfaheya_tab"]').val(tab)
    var url = new URL(window.location.href)
    url.searchParams.set('tab', tab)
    url.searchParams.delete('saved')
    window.history.replaceState(null, '', url)
    $('.rfs-toast').remove()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  // Images: the WordPress media library.
  $page.on('click', '.rfs-image-pick', function (e) {
    e.preventDefault()
    var $btn = $(this)
    var id = $btn.data('target')
    var frame = wp.media({ title: 'Choose image', multiple: false, library: { type: 'image' } })
    frame.on('select', function () {
      var a = frame.state().get('selection').first().toJSON()
      var src = a.sizes && a.sizes.medium ? a.sizes.medium.url : a.url
      $('#' + id).val(a.id).trigger('change')
      $('#' + id + '-preview').html('<img src="' + src + '" alt="">')
      $btn.closest('.rfs-image').addClass('has-image')
      if ($btn.data('logo')) setLogo(a.url)
      $page.trigger('rfs:image')
      dirty()
    })
    frame.open()
  })
  $page.on('click', '.rfs-image-clear', function (e) {
    e.preventDefault()
    var id = $(this).data('target')
    $('#' + id).val('')
    $('#' + id + '-preview').empty()
    $(this).closest('.rfs-image').removeClass('has-image')
    if ($(this).siblings('.rfs-image-pick').data('logo')) setLogo('')
    $page.trigger('rfs:image')
    dirty()
  })

  // Range ⇄ number, and the logo preview follows.
  $page.on('input', '.rfs-range input[type=range]', function () {
    $('#' + $(this).data('for')).val(this.value)
    sizeLogo()
    dirty()
  })
  $page.on('input', '.rfs-range input[type=number]', function () {
    $(this).closest('.rfs-range').find('input[type=range]').val(this.value)
    sizeLogo()
  })

  var $preview = $('.rfs-logo-preview')
  function setLogo(src) {
    $preview.find('img').attr('src', src || '').toggle(Boolean(src))
    $preview.toggleClass('is-empty', !src)
  }
  function sizeLogo() {
    var v = function (k) {
      return parseInt($('input[data-logo="' + k + '"]').val(), 10) || 0
    }
    $preview.find('img[data-size="desktop"]').css('height', v('logo_height') + 'px')
    $preview.find('img[data-size="mobile"]').css('height', v('logo_height_mobile') + 'px')
    $preview.find('img[data-size="footer"]').css('width', v('logo_footer') + 'px')
  }
  if ($preview.length) {
    setLogo($preview.data('logo-src'))
    sizeLogo()
  }

  // A gentle reminder when there are changes not saved yet.
  var changed = false
  function dirty() {
    changed = true
    $('.rfs-savebar').addClass('is-dirty')
  }
  $page.on('input change', '.rfs-form :input', dirty)
  $('.rfs-form').on('submit', function () {
    changed = false
    $(this).find('.rfs-savebar button').text('Saving…').prop('disabled', true)
  })
  window.addEventListener('beforeunload', function (e) {
    if (changed) {
      e.preventDefault()
      e.returnValue = ''
    }
  })

  setTimeout(function () {
    $('.rfs-toast').addClass('is-leaving')
  }, 4000)

  // ---------- Live slider preview (Hero slider tab) ----------
  var $sp = $('.rfs-slider-preview')
  if ($sp.length) {
    var builtin = $sp.data('builtin') || []
    var active = 0
    var field = function (i, k) {
      return $('#rfaheya-slider-slide_' + i + '_' + k)
    }
    var slides = function () {
      var list = []
      for (var i = 1; i <= 4; i++) {
        var show = field(i, 'show')
        if (show.length && !show.is(':checked')) continue
        var img = $('#rfaheya-slider-slide_' + i + '_image-preview img').attr('src') || ''
        var title = $.trim(field(i, 'title').val() || '')
        if (!img && !title) continue
        list.push({
          n: i,
          image: img || builtin[(i - 1) % 3] || '',
          eyebrow: field(i, 'eyebrow').val() || '',
          title: title,
          text: field(i, 'text').val() || '',
          button: field(i, 'button').val() || '',
        })
      }
      return list
    }
    var draw = function () {
      var list = slides()
      $sp.empty()
      if (!list.length) {
        $sp.append($('<p class="rfs-sp-empty">').text('No slides to show: switch a slide on or give it a title.'))
        return
      }
      if (active >= list.length) active = 0
      list.forEach(function (s, idx) {
        var $s = $('<button type="button" class="rfs-sp-slide">').toggleClass('is-on', idx === active).attr('data-n', s.n)
        if (s.image) $s.append($('<img alt="">').attr('src', s.image))
        $s.append('<span class="rfs-sp-shade"></span>')
        $s.append($('<span class="rfs-sp-no">').text(String(idx + 1).padStart(2, '0')))
        $s.append($('<span class="rfs-sp-closed">').text(s.title || s.eyebrow))
        var $copy = $('<span class="rfs-sp-copy">')
        if (s.eyebrow) $copy.append($('<span class="rfs-sp-eb">').text(s.eyebrow))
        if (s.title) $copy.append($('<span class="rfs-sp-title">').text(s.title))
        if (s.text) $copy.append($('<span class="rfs-sp-text">').text(s.text))
        if (s.button) $copy.append($('<span class="rfs-sp-btn">').text(s.button + ' →'))
        $s.append($copy)
        $sp.append($s)
      })
    }
    // Tap a slide: it opens, and its fields open and scroll into view.
    $sp.on('click', '.rfs-sp-slide', function () {
      active = $(this).index()
      draw()
      var n = $(this).data('n')
      var $card = $('#rfaheya-slider-slide_' + n + '_title').closest('details')
      $('.rfs-panel[data-panel] details.rfs-collapsible').removeClass('is-target')
      $card.attr('open', true).addClass('is-target')
      $card[0] && $card[0].scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    // Editing a slide's fields shows that slide.
    $page.on('focusin', '[id^="rfaheya-slider-slide_"]', function () {
      var n = parseInt(this.id.replace('rfaheya-slider-slide_', ''), 10)
      var idx = slides().map(function (s) { return s.n }).indexOf(n)
      if (idx >= 0 && idx !== active) {
        active = idx
        draw()
      }
    })
    $page.on('input change', '[id^="rfaheya-slider-slide_"]', draw)
    $page.on('rfs:image', draw)
    $('.rfs-seg').on('click', 'button', function () {
      $(this).addClass('is-on').siblings().removeClass('is-on')
      $sp.toggleClass('is-desktop', $(this).data('view') === 'desktop').toggleClass('is-phone', $(this).data('view') === 'phone')
    })
    draw()
  }

  // ---------- Announcement bar preview (Home tab) ----------
  var $ann = $('.rfs-ann-preview b')
  if ($ann.length) {
    var at = 0
    var lines = function () {
      return [1, 2, 3].map(function (i) { return $.trim($('#rfaheya-home-announcement_' + i).val() || '') }).filter(Boolean)
    }
    var show = function () {
      var l = lines()
      $ann.text(l.length ? l[at % l.length] : '—')
    }
    $page.on('input', '[id^="rfaheya-home-announcement_"]', function () {
      at = parseInt(this.id.slice(-1), 10) - 1
      show()
    })
    setInterval(function () {
      at++
      show()
    }, 3500)
    show()
  }
})
