/* Products → Offers & discounts, the add / edit page: the kind of offer shows its own fields;
   the products lists (search, tick all, clear) with the chosen ones as chips on top. */
;(function () {
  var form = document.querySelector('.rfd-form')
  if (!form) return
  var card = form.querySelector('.rfd-rule')
  var bar = form.querySelector('.rfs-savebar')
  var dirty = false

  function picked(block) {
    var box = block.querySelector('.rfd-picked')
    var ticked = [].slice.call(block.querySelectorAll('.rfd-product input:checked'))
    block.querySelector('.rfd-count').textContent = ticked.length ? ticked.length + ' chosen' : 'None chosen = every product'
    box.innerHTML = ''
    ticked.forEach(function (input) {
      var chip = document.createElement('button')
      chip.type = 'button'
      chip.className = 'rfd-pick'
      chip.textContent = input.closest('.rfd-product').querySelector('span').textContent
      chip.title = 'Remove'
      chip.addEventListener('click', function () {
        input.checked = false
        picked(block)
        touch()
      })
      box.appendChild(chip)
    })
    box.hidden = ticked.length === 0
  }
  function wireProducts(block) {
    var search = block.querySelector('.rfd-search')
    search.addEventListener('input', function () {
      var q = search.value.trim().toLowerCase()
      block.querySelectorAll('.rfd-product').forEach(function (row) {
        row.hidden = q !== '' && row.dataset.name.indexOf(q) === -1
      })
    })
    // Enter in the search box must not send the form.
    search.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') e.preventDefault()
    })
    block.querySelector('.rfd-all').addEventListener('click', function () {
      block.querySelectorAll('.rfd-product:not([hidden]) input').forEach(function (b) { b.checked = true })
      picked(block); touch()
    })
    block.querySelector('.rfd-none').addEventListener('click', function () {
      block.querySelectorAll('.rfd-product input').forEach(function (b) { b.checked = false })
      picked(block); touch()
    })
    block.querySelector('.rfd-list').addEventListener('change', function () { picked(block) })
    picked(block)
  }
  function kind() {
    var checked = card.querySelector('.rfd-kinds input:checked')
    var k = checked ? checked.value : 'percent'
    card.dataset.kind = k
    card.querySelectorAll('[data-kinds]').forEach(function (el) {
      el.hidden = el.dataset.kinds.split(' ').indexOf(k) === -1
    })
    var label = card.querySelector('[data-text-percent]')
    var key = 'text' + k.charAt(0).toUpperCase() + k.slice(1)
    if (label && label.dataset[key]) label.textContent = label.dataset[key]
    var other = card.querySelector('.rfd-get-other')
    var getScope = card.querySelector('.rfd-get-scope')
    if (getScope) getScope.hidden = k !== 'bogo' || !(other && other.checked)
    card.querySelector('.rfd-scope[data-scope="main"] .rfd-scope-title').textContent =
      k === 'bogo' && other && other.checked ? 'Bottles to buy' : k === 'free_shipping' || k === 'gift' ? 'Bottles that count towards it' : 'Which bottles'
  }
  // Fields shared by several kinds (the amount, "how many") are typed in the kind's own box.
  function mirror() {
    card.querySelectorAll('.rfd-mirror').forEach(function (m) {
      var holder = m.closest('[data-kinds]')
      if (holder && holder.hidden) return
      var real = card.querySelector('[name$="[' + m.dataset.mirror + ']"]')
      if (real) real.value = m.value
    })
  }
  function touch() {
    dirty = true
    bar.classList.add('is-dirty')
  }

  card.querySelectorAll('.rfd-scope').forEach(wireProducts)
  card.addEventListener('change', function (e) {
    if (e.target.matches('.rfd-kinds input, .rfd-get-other')) {
      kind()
      mirror()
    }
    touch()
  })
  card.addEventListener('input', function (e) {
    if (e.target.matches('.rfd-mirror')) mirror()
    touch()
  })
  kind()

  form.addEventListener('submit', function () {
    mirror()
    dirty = false
    var b = form.querySelector('.rfs-savebar button')
    b.textContent = 'Saving…'
    b.disabled = true
  })
  window.addEventListener('beforeunload', function (e) {
    if (dirty) { e.preventDefault(); e.returnValue = '' }
  })
})()

/* The list: the "saved" note fades. */
setTimeout(function () {
  var t = document.querySelector('.rfs-toast')
  if (t) t.classList.add('is-leaving')
}, 4000)
