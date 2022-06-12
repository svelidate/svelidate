import { createConditionalValidator } from "../validation/factories/validatorCollectionFactory"
import type {
	SvelidateForm,
	UninitializedForm,
	Field,
	NakedSvelidateForm,
	Subscriber,
	ValidatorCollection,
	JsValidatorPredicate,
} from "../types"

export function validateIf<
	T extends ValidatorCollection | ValidatorCollection[]
>(predicate: JsValidatorPredicate, validators: T) {
	if (typeof validators === "function") {
		return createConditionalValidator(predicate, validators) as T
	}
	return validators.map(validator =>
		createConditionalValidator(predicate, validator)
	) as T
}

export function getFormFieldValues<F extends UninitializedForm>(
	form: SvelidateForm<F>
) {
	const values = {} as Record<PropertyKey, unknown>
	forEachFormField(form, (formField, key) => {
		values[key] = formField.value
	})
	return values
}

export function forEachFormField<F extends UninitializedForm>(
	form: SvelidateForm<F>,
	callback: (formField: Required<Field>, key: string) => void
) {
	for (const key in form) {
		if (isFormStateKey(key)) continue
		callback(form[key], key)
	}
}

export function createNaked$Form<F extends UninitializedForm>(form: F) {
	return Object.entries(form).reduce((prev, [key, value]) => {
		const formField: Required<Field> = {
			errors: [],
			touched: false,
			validators: [],
			invalid: false,
			...value,
		}
		return {
			...prev,
			[key]: formField,
		}
	}, {} as NakedSvelidateForm<F>)
}

export function isFormStateKey(key: string) {
	return key && key[0] === "$" ? true : false
}

export function dispatch<F extends UninitializedForm>(
	to: Subscriber[],
	form: SvelidateForm<F>
) {
	to.forEach(subscriber => subscriber(form))
}

export function getParentForm(input: HTMLInputElement) {
	let current: HTMLElement = input
	while (current !== null) {
		if (current.tagName === "FORM") {
			return current as HTMLFormElement
		}
		current = current.parentElement
	}
	return null
}