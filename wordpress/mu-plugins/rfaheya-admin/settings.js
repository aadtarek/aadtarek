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
})
