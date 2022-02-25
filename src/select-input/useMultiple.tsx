import { SetupContext, computed, ref } from '@vue/composition-api';
import isObject from 'lodash/isObject';
import { TdSelectInputProps, SelectInputChangeContext, SelectInputKeys } from './type';
import TagInput, { TagInputValue } from '../tag-input';
import { SelectInputCommonProperties } from './interface';
import { InputValue } from '../input';

export interface RenderSelectMultipleParams {
  commonInputProps: SelectInputCommonProperties;
  onInnerClear: (context: { e: MouseEvent }) => void;
}

const DEFAULT_KEYS = {
  label: 'label',
  key: 'key',
  children: 'children',
};

export default function useMultiple(props: TdSelectInputProps, context: SetupContext) {
  const tagInputRef = ref();
  const iKeys = computed<SelectInputKeys>(() => ({ ...DEFAULT_KEYS, ...props.keys }));
  const tags = computed<TagInputValue>(() => {
    if (!(props.value instanceof Array)) {
      return isObject(props.value) ? [props.value[iKeys.value.label]] : [props.value];
    }
    return props.value.map((item) => (isObject(item) ? item[iKeys.value.label] : item));
  });

  const tPlaceholder = computed<string>(() => (!tags.value || !tags.value.length ? props.placeholder : ''));

  const onTagInputChange = (val: TagInputValue, context: SelectInputChangeContext) => {
    // 避免触发浮层的显示或隐藏
    if (context.trigger === 'tag-remove') {
      context.e?.stopPropagation();
    }
    props.onTagChange?.(val, context);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderSelectMultiple = (p: RenderSelectMultipleParams, h: any) => (
    <TagInput
      ref="tagInputRef"
      {...p.commonInputProps}
      scopedSlots={context.slots}
      label={props.label}
      autoWidth={props.borderless || props.autoWidth}
      minCollapsedNum={props.minCollapsedNum}
      collapsedItems={props.collapsedItems}
      tag={props.tag}
      valueDisplay={props.valueDisplay}
      placeholder={tPlaceholder.value}
      value={tags.value}
      onChange={onTagInputChange}
      on={{
        // 'input-change': props.onInputChange,
        clear: p.onInnerClear,
      }}
      tagProps={props.tagProps}
      onBlur={(val: TagInputValue, context: { inputValue: InputValue; e: FocusEvent }) => {
        props.onBlur?.(props.value, { ...context, tagInputValue: val });
      }}
      onFocus={(val: TagInputValue, context: { inputValue: InputValue; e: FocusEvent }) => {
        props.onFocus?.(props.value, { ...context, tagInputValue: val });
      }}
      {...props.tagInputProps}
    />
  );

  return {
    tags,
    tPlaceholder,
    tagInputRef,
    renderSelectMultiple,
  };
}
