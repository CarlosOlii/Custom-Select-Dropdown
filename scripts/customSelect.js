export default class CustomSelect {
    constructor(element) {
        this.element = element;
        this.options = getFormattedOptions(element.querySelectorAll('option'));
        this.customElement = document.createElement('div');
        this.labelElement = document.createElement('span');
        this.optionsCustomElement = document.createElement('ul');
        this.hasIcon = element.hasAttribute('data-icon');

        setupCustomElement(this);
        setupOptions(this);
        setupEventListeners(this);
        element.style.display = 'none';
        element.after(this.customElement);
    }

    get selectedOption() {
        return this.options.find(option => option.selected);
    }

    get selectedOptionIndex() {
        return this.options.indexOf(this.selectedOption);
    }

    selectValue(value) {
        const newSelectedOption = this.options.find(option => {
            return option.value === value;
        })
        const prevSelectedOption = this.selectedOption;
        prevSelectedOption.selected = false;
        prevSelectedOption.element.selected = false;

        newSelectedOption.selected = true;
        newSelectedOption.element.selected = true;

        const container = document.createElement('div');
        if (this.hasIcon) {
            const iconElement = addIcon(value);
            container.append(iconElement, ' ');
        }

        this.labelElement.innerHTML = '';
        container.append(newSelectedOption.label);
        this.labelElement.append(container);

        const prevCustomElement = this.optionsCustomElement.querySelector(`[data-value='${prevSelectedOption.value}']`);
        if (prevCustomElement) {
            prevCustomElement.classList.remove('selected');
        }
        const newCustomElement = this.optionsCustomElement.querySelector(`[data-value='${newSelectedOption.value}']`);
        newCustomElement.classList.add('selected');
        newCustomElement.scrollIntoView({block: 'nearest'});
    }
}

function setupCustomElement(select) {
    select.customElement.classList.add('custom-select-container');
    select.customElement.tabIndex = 0;

    select.labelElement.classList.add('custom-select-value');
    select.labelElement.innerText = select.selectedOption.label;
    select.customElement.append(select.labelElement);

    select.optionsCustomElement.classList.add('custom-select-options');
}

function setupOptions(select) {
    select.options.forEach(option => {
        if (!option.value) {
            return;
        }

        const optionElement = document.createElement('li');
        optionElement.classList.add('custom-select-option');
        optionElement.classList.toggle('selected', option.selected);
        optionElement.dataset.value = option.value;
        optionElement.innerHTML = option.label;
        optionElement.addEventListener('click', () => {
            select.selectValue(option.value);
            select.optionsCustomElement.classList.remove('show');
        })
        select.optionsCustomElement.append(optionElement);

        if (select.hasIcon) {
            const iconElement = addIcon(option.value);
            optionElement.prepend(iconElement, ' ');
        }
    });

    select.customElement.append(select.optionsCustomElement);

    return select;
}

function setupEventListeners(select) {
    select.labelElement.addEventListener('click', () => {
        select.optionsCustomElement.classList.toggle('show');
    });

    select.customElement.addEventListener('blur', () => {
        select.optionsCustomElement.classList.remove('show');
    });

    let debounceTimeout;
    let searchTerm = '';
    select.customElement.addEventListener('keydown', e => {
        switch (e.code) {
            case 'Space':
                select.optionsCustomElement.classList.toggle('show');
                break
            case 'ArrowUp': {
                const prevOption = select.options[select.selectedOptionIndex - 1];
                if (prevOption) {
                    select.selectValue(prevOption.value);
                }
                break;
            }
            case 'ArrowDown': {
                const nextOption = select.options[select.selectedOptionIndex + 1];
                if (nextOption) {
                    select.selectValue(nextOption.value);
                }
                break;
            }
            case 'Enter':
            case 'Escape':
                select.optionsCustomElement.classList.remove('show');
                break;
            default: {
                clearTimeout(debounceTimeout);
                searchTerm += e.key;
                debounceTimeout = setTimeout(() => {
                    searchTerm = '';
                }, 500)

                const searchedOption = select.options.find(option => {
                    return option.label.toLowerCase().startsWith(searchTerm);
                })
                if (searchedOption) {
                    select.selectValue(searchedOption.value);
                }
            }
        }
    });

    return select;
}

function addIcon(value) {
    const iconElement = document.createElement('span');
    iconElement.classList.add('icon', 'icon-' + value);

    return iconElement;
}

function getFormattedOptions(optionElements) {
    return [...optionElements].map(optionElement => {
        return {
            value: optionElement.value,
            label: optionElement.label,
            selected: optionElement.selected,
            element: optionElement,
        }
    });
}
