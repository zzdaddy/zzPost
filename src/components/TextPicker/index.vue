<template>
  <div class="text-picker-box">
    <textarea
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :class="`textarea textarea-bordered ${textareaClass}`"
      placeholder="输入文字"
    ></textarea>
    <div>
      <color-picker format="rgb" v-model:pureColor="accentColor"></color-picker>
      <span class="text-16px" :style="{ color: accentColor }">强调色</span>
    </div>
    <div>
      <color-picker format="rgb" v-model:pureColor="ignoreColor"></color-picker>
      <span class="text-16px" :style="{ color: ignoreColor }">忽略色</span>
    </div>
    <div
      class="picker-box font-['DouYinMeiHao'] flex flex-wrap gap-1 text-14px max-w-200px select-none"
      @mousedown="onMouseDown"
      @mousemove.capture="onMouseMove"
      @mouseup="onMouseUp"
    >
      <template v-for="(text, index) in modelValue">
        <div
          :class="[
            (isSelectedText(index, text) && 'bg-#07C060') || 'bg-#F7f7f7',
          ]"
          class="w-18px h-18px text-center leading-18px text-cell"
          :data-index="index"
        >
          {{ text }}
        </div>
      </template>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useArrayUnique, useThrottleFn } from "@vueuse/core";
import { ColorPicker } from "vue3-colorpicker";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  textareaClass: {
    type: String,
    default: "",
  },
});
type TextItem = {
  index: string | number;
  text: string;
};
const emits = defineEmits(["update:modelValue", "updateHtmlText"]);
const selecting = ref(false);
const selectTexts = ref<TextItem[]>([]);
const accentColor = ref("#000000"); // 强调色
const ignoreColor = ref("#dedede"); // 忽略色
let uniqueTexts = useArrayUnique<any>(
  selectTexts,
  (a, b) => a.index === b.index
);
const onMouseDown = (e: any) => {
  //   console.log(`e`, e);
  selecting.value = true;
  if (Array.from(e.target?.classList)?.includes("text-cell")) {
    // 如果是单元格，获取到当前索引，把文字和索引保存起来
    const index = e.target.dataset.index;
    if (
      !!selectTexts.value.find(
        (item) => item.index == index && item.text == e.target.innerText
      )
    ) {
      selectTexts.value = selectTexts.value.filter(
        (item) => !(item.index == index && item.text == e.target.innerText)
      );
    } else {
      selectTexts.value.push({ index, text: e.target.innerText });
    }
    // emit("update:modelValue", [...selectTextMap.value].join(""));
  }
};

const isSelectedText = (index: string | number, text: string) => {
  return (
    uniqueTexts.value.findIndex(
      (item) => +item.index === +index && item.text === text
    ) !== -1
  );
};
// 节流， 150ms 内触发一次
const onMouseMove = useThrottleFn((e) => {
  if (!selecting.value) return;
  //   console.log(`e`, e);
  if (Array.from(e.target?.classList)?.includes("text-cell")) {
    // 如果是单元格，获取到当前索引，把文字和索引保存起来
    const index = e.target.dataset.index;
    selectTexts.value.push({ index, text: e.target.innerText });
    // emit("update:modelValue", [...selectTextMap.value].join(""));
  }
}, 25);

const onMouseUp = (e: any) => {
  if (!selecting.value) return;
  selecting.value = false;
  //   console.log(`selectTexts`, uniqueTexts.value);
};

// 选中的值变化后，修改样式
watch(
  () => props.modelValue,
  (newVal) => {
    // console.log(`newVal`, newVal);
    selectTexts.value = [];
    // uniqueTexts.value = [];
  }
);

// 选中文字后， 组装富文本，同步到画布
watch(uniqueTexts, (val) => {
  console.log(`val`, val);
  checkAndEmitHtmlText();
});

const checkAndEmitHtmlText = () => {
  // 原始文字
  const textArr = props.modelValue.split("");
  let customTextMap = new Map();
  // 组装, 抛出带有配置的文字Map  key: index+text value 配置
  textArr.forEach((text, index) => {
    if (isSelectedText(index, text)) {
      customTextMap.set(`${index}-${text}`, {
        fontColor: accentColor.value,
        index,
        text,
      });
    } else {
      customTextMap.set(`${index}-${text}`, {
        fontColor: ignoreColor.value,
        index,
        text,
      });
    }
  });
  console.log(`resultText`, customTextMap);
  emits("updateHtmlText", customTextMap);
};
onMounted(() => {
  //   checkAndEmitHtmlText();
  setTimeout(() => {
    let defaultText = props.modelValue;
    // 默认文字  10 - 30
    defaultText.split("").forEach((text, index) => {
      if (index <= 31 && index >= 11) {
        selectTexts.value.push({ index, text });
      }
    });
  }, 200);
});
</script>
<style lang="less" scoped></style>
