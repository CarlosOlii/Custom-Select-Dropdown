import CustomSelect from './customSelect.js'

const selectElements = document.querySelectorAll('[data-custom]');
selectElements.forEach(selectElement => {
  new CustomSelect(selectElement);
});
