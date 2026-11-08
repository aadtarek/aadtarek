/* Products → Discount rules: add / delete rules, search and tick products. */
;(function () {
  var form = document.querySelector('.rfd-form')
  if (!form) return
  var list = form.querySelector('.rfd-rules')
  var empty = form.querySelector('.rfd-empty')
  var bar = form.querySelector('.rfs-savebar')
  var next = list.querySelectorAll('.rfd-rule').length
  var dirty = false

  function count(card) {
    var n = card.querySelectorAll('.rfd-product input:checked').length
    card.querySelector('.rfd-count').textContent = n ? n + ' ticked' : 'Every product'
  }
  function wire(card) {
    var search = card.querySelector('.rfd-search')
    search.addEventListener('input', function () {
      var q = search.value.trim().toLowerCase()
      card.querySelectorAll('.rfd-product').forEach(function (row) {
        row.hidden = q !== '' && row.dataset.name.indexOf(q) === -1
      })
    })
    card.querySelector('.rfd-all').addEventListener('click', function () {
      card.querySelectorAll('.rfd-product:not([hidden]) input').forEach(function (b) { b.checked = true })
      count(card); touch()
    })
    card.querySelector('.rfd-none').addEventListener('click', function () {
      card.querySelectorAll('.rfd-product input').forEach(function (b) { b.checked = false })
      count(card); touch()
    })
    card.querySelector('.rfd-delete').addEventListener('click', function () {
      card.querySelector('.rfd-deleted').value = '1'
      card.hidden = true
      empty.hidden = list.querySelectorAll('.rfd-rule:not([hidden])').length > 0
      touch()
    })
    card.addEventListener('change', function () { count(card); touch() })
    count(card)
  }
  function touch() {
    dirty = true
    bar.classList.add('is-dirty')
  }
  list.querySelectorAll('.rfd-rule').forEach(wire)

  form.querySelector('.rfd-add').addEventListener('click', function () {
    var html = document.getElementById('rfd-template').innerHTML.replace(/__i__/g, String(next++))
    var holder = document.createElement('div')
    holder.innerHTML = html.trim()
    var card = holder.firstElementChild
    list.appendChild(card)
    wire(card)
    empty.hidden = true
    card.querySelector('.rfd-name').focus()
    card.scrollIntoView({ behavior: 'smooth', block: 'start' })
    touch()
  })
  form.addEventListener('input', touch)
  form.addEventListener('submit', function () {
    dirty = false
    var b = form.querySelector('.rfs-savebar button')
    b.textContent = 'Saving…'
    b.disabled = true
  })
  window.addEventListener('beforeunload', function (e) {
    if (dirty) { e.preventDefault(); e.returnValue = '' }
  })
  setTimeout(function () {
    var t = document.querySelector('.rfs-toast')
    if (t) t.classList.add('is-leaving')
  }, 4000)
})()
