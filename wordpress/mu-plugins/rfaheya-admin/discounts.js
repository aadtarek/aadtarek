/* Products → Offers & discounts: add / delete offers, the kind of offer shows its own fields,
   search and tick products (one list per "which bottles" block). */
;(function () {
  var form = document.querySelector('.rfd-form')
  if (!form) return
  var list = form.querySelector('.rfd-rules')
  var empty = form.querySelector('.rfd-empty')
  var bar = form.querySelector('.rfs-savebar')
  var next = list.querySelectorAll('.rfd-rule').length
  var dirty = false

  function count(block) {
    var n = block.querySelectorAll('.rfd-product input:checked').length
    block.querySelector('.rfd-count').textContent = n ? n + ' ticked' : 'Every product'
  }
  function wireProducts(block) {
    var search = block.querySelector('.rfd-search')
    search.addEventListener('input', function () {
      var q = search.value.trim().toLowerCase()
      block.querySelectorAll('.rfd-product').forEach(function (row) {
        row.hidden = q !== '' && row.dataset.name.indexOf(q) === -1
      })
    })
    block.querySelector('.rfd-all').addEventListener('click', function () {
      block.querySelectorAll('.rfd-product:not([hidden]) input').forEach(function (b) { b.checked = true })
      count(block); touch()
    })
    block.querySelector('.rfd-none').addEventListener('click', function () {
      block.querySelectorAll('.rfd-product input').forEach(function (b) { b.checked = false })
      count(block); touch()
    })
    block.addEventListener('change', function () { count(block) })
    count(block)
  }
  // The fields of the chosen kind of offer; the rest hide.
  function kind(card) {
    var checked = card.querySelector('.rfd-kinds input:checked')
    var k = checked ? checked.value : 'percent'
    card.dataset.kind = k
    card.querySelectorAll('[data-kinds]').forEach(function (el) {
      el.hidden = el.dataset.kinds.split(' ').indexOf(k) === -1
    })
    var label = card.querySelector('[data-text-percent]')
    if (label && label.dataset['text' + k.charAt(0).toUpperCase() + k.slice(1)]) label.textContent = label.dataset['text' + k.charAt(0).toUpperCase() + k.slice(1)]
    // Buy X get Y from other bottles: the second "which bottles" block.
    var other = card.querySelector('.rfd-get-other')
    var getScope = card.querySelector('.rfd-get-scope')
    if (getScope) getScope.hidden = k !== 'bogo' || !(other && other.checked)
    card.querySelector('.rfd-scope[data-scope="main"] .rfd-scope-title').textContent =
      k === 'bogo' && other && other.checked ? 'Bottles to buy' : k === 'free_shipping' || k === 'gift' ? 'Bottles that count towards it' : 'Which bottles'
  }
  // Fields shared by several kinds (the amount, "how many") are typed in the kind's own box.
  function mirror(card) {
    card.querySelectorAll('.rfd-rule .rfd-mirror, .rfd-mirror').forEach(function (m) {
      if (m.closest('[data-kinds]') && m.closest('[data-kinds]').hidden) return
      var real = card.querySelector('[name$="[' + m.dataset.mirror + ']"]')
      if (real) real.value = m.value
    })
  }
  function wire(card) {
    card.querySelectorAll('.rfd-products').forEach(function (block) { wireProducts(block.closest('.rfd-scope')) })
    card.querySelector('.rfd-delete').addEventListener('click', function () {
      card.querySelector('.rfd-deleted').value = '1'
      card.hidden = true
      empty.hidden = list.querySelectorAll('.rfd-rule:not([hidden])').length > 0
      touch()
    })
    card.addEventListener('change', function (e) {
      if (e.target.matches('.rfd-kinds input, .rfd-get-other')) {
        kind(card)
        mirror(card)
      }
      touch()
    })
    card.addEventListener('input', function (e) {
      if (e.target.matches('.rfd-mirror')) mirror(card)
    })
    kind(card)
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
    list.querySelectorAll('.rfd-rule').forEach(mirror)
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
