<script lang="ts" setup>
import { onMounted, ref } from "vue";
// import { useClipboard } from "@vueuse/core";
// import { logger } from "@kirklin/logger";
import //   classifyColor,
//   downloadPNGForCanvas,
//   getPixelColor,
"~/utils/canvas";
import { Rect, Box, Text } from "leafer-ui";
// import { HTMLText } from "@leafer-in/html";
// import { HTMLText } from "~/plugins/HtmlText";
import { LeaferController } from "./LeaferController";
import defaultImage from "~/assets/imgs/logo.png";
import { toast } from "vue3-toastify";
// const permissionRead = usePermission('clipboard-read')
// const permissionWrite = usePermission('clipboard-write')
// 为何注释 ? 请看components的readme.md
// import Toast from '~/components/Toast/index.vue';
const Stage = ref();
const canvasContainerRef = ref();
const viewContainer = ref();
const fileInput = ref();
const frameWidth = ref(375);
const frameHeight = ref(500);
// const frameRatio = ref(0.75); // 宽高比 3/4
// const ShareFrame = ref();
const canvasContent = ref();
const canvasTitle = ref();
const canvasAuthor = ref();
const canvasImage = ref();
const canvasGroundRect = ref();
const isInited = ref(false);
const shareContent = ref(
  `文字是一种无形的力量，能穿越时空，传递深刻思想和情感。它如同魔法，启发、感染、改变，连接人们的心灵，引导社会发展，点燃勇气的火花。文字，是强大的传达之道。`
);
// 32个字正好是两行
const shareTitle = ref("传递思想，表达观点");
const shareAuthor = ref("早早传书");

const shareImage = ref(defaultImage);

const computeCanvasSize = () => {
  //   const viewBounds = viewContainer.value.getBoundingClientRect();
  //   console.log(`width`, viewBounds.width);
  //   console.log(`height`, viewBounds.height);
};
const setBackgroundRect = () => {
  canvasGroundRect.value = new Rect({
    width: frameWidth.value,
    height: frameHeight.value,
    fill: "#F7F7F7",
  });
  Stage.value.addRect(canvasGroundRect.value);
};
const initByLeafer = () => {
  computeCanvasSize();
  Stage.value = null;
  Stage.value = new LeaferController(canvasContainerRef);
  Stage.value.removeStage();
  setBackgroundRect();
  if (!canvasContent.value) {
    canvasContent.value = new Box({
      y: 200,
      x: 12,
      fontSize: 18,
      width: 350,
      editable: true,
      //   editSize: "size",
      letterSpacing: 2,
      fontFamily: "DouYinMeiHao",
      fontWeight: 500,
    });
  }

  if (!canvasTitle.value) {
    canvasTitle.value = new Text({
      x: 90,
      y: 420,
      fontSize: 12,
      lineHeight: 20,
      fontFamily: "DouYinMeiHao",
      width: 266,
      editable: true,
      text: shareTitle.value,
    });
  }

  if (!canvasAuthor.value) {
    canvasAuthor.value = new Text({
      x: 90,
      y: 460,
      width: 266,
      fontSize: 10,
      editable: true,
      text: shareAuthor.value,
    });
  }

  if (!canvasImage.value) {
    canvasImage.value = new Rect({
      width: 60,
      height: 60,
      x: 12,
      y: 422,
      editable: true,
      fill: {
        type: "image",
        url: shareImage.value,
        mode: "fit",
      },
      //   draggable: true,
    });
  }

  Stage.value.addRect(canvasContent.value);
  Stage.value.addRect(canvasTitle.value);
  Stage.value.addRect(canvasAuthor.value);
  Stage.value.addRect(canvasImage.value);
};
// 判断是不是中文 中文两个字符 其他占一个字符
const isChinese = (str: string) => {
  let re = /[^\u4e00-\u9fa5]/;
  return !re.test(str);
};
const formatTextSize = (text: string, baseSize: number) => {
  return isChinese(text) ? baseSize : baseSize * 0.6;
};
const setCanvasContent = (customText?: any) => {
  if (!canvasContent.value || !shareContent.value) return;
  canvasContent.value.removeAll(true);
  let textSize = 16,
    textSpacing = 2,
    lineSpacing = 8;
  let textArr = shareContent.value.split("");
  let textPosition: any[] = [];
  textArr.forEach((text: string, index: number) => {
    let x = (index * 16 + 16) % 350;
    let y = Math.floor((index * 16) / 350) * 16;
    if (index === 0) {
      x = 0;
      y = 0;
    } else {
      x =
        textPosition[index - 1].x +
        formatTextSize(textPosition[index - 1].text, textSize) +
        textSpacing;
      if (x + textSize > 350) {
        x = 0;
        y = textPosition[index - 1].y + textSize + lineSpacing;
      } else {
        y = textPosition[index - 1].y;
      }
    }
    textPosition.push({ x, y, text: text });
  });
  //   console.log(`customText`, customText);
  textPosition.forEach((textConfig, index) => {
    let { x, y, text } = textConfig;
    let fontFamily = "DouYinMeiHao";
    let fontSize = 16;
    let fontColor = "#000000";
    let customConfig = customText && customText.get(`${index}-${text}`);
    if (customConfig) {
      //   console.log(`customConfig`, customConfig);
      fontSize = customConfig.fontSize || fontSize;
      fontFamily = customConfig.fontFamily || fontFamily;
      fontColor = customConfig.fontColor || fontColor;
    }
    let textCell = new Text({
      x,
      y,
      fontSize,
      fontFamily,
      editable: false,
      fill: fontColor,
      text: text,
    });
    canvasContent.value.add(textCell);
  });
  //   canvasContent.value.text = htmlText || shareContent.value;
};
// watch(shareContent, () => {
//   setCanvasContent();
// });

const setCanvasTitle = () => {
  if (!canvasTitle.value) return;
  canvasTitle.value.text = shareTitle.value;
};
watch(shareTitle, () => {
  setCanvasTitle();
});

const setCanvasAuthor = (htmlText?: string) => {
  if (!canvasAuthor.value) return;
  canvasAuthor.value.text = htmlText || shareAuthor.value;
};

const updateContentText = (customText: any) => {
  setCanvasContent(customText);
};

watch(shareAuthor, () => {
  setCanvasAuthor();
});

// 打开文件选择器
const openFileSelect = () => {
  fileInput.value.click();
};
// const exportImage2 = () => {
//   const { x, y, width, height } = PixelRectFrame.value;
//   const canvas: Canvas = new Canvas({
//     x,
//     y,
//     width,
//     height,
//   });
//   // 导出时, 清除背景
//   PixelRectFrame.value.children.forEach((rect: Rect) => {
//     if (rect.fill === "#ebe5ef") {
//       rect.fill = "rgba(0,0,0,0)";
//     }
//   });
//   // 只画, 不在页面呈现
//   canvas.draw(PixelRectFrame.value);

//   downloadPNGForCanvas(canvas.canvas.toDataURL() as string, "test.png");
//   canvas.destroy();
// };
const setCanvasImage = () => {
  canvasImage.value.fill = {
    type: "image",
    url: shareImage.value,
    mode: "fit",
  };
};
const uploadFile = (e: any) => {
  let file = e.target.files[0];
  console.log(`正在绘图`, file);
  console.time();
  const img = new Image();

  const ratio = window.devicePixelRatio;
  const fileReader = new FileReader();
  fileReader.readAsDataURL(file);

  fileReader.onload = (readerEvent) => {
    img.src = readerEvent.target?.result as string;
    img.onload = () => {
      console.log(`img.src`, img.src);
      shareImage.value = img.src;
      setCanvasImage();
      //   const canvas: Canvas = new Canvas({
      //     x: 100,
      //     y: 100,
      //     width: img.width,
      //     height: img.height,
      //     stroke: "black",
      //     strokeWidth: 1,
      //   });
      //   //   GroundCanvas.value = canvas;
      //   const { context } = canvas;
      //   console.log(`img`, img.width, img.height);
      //   context.drawImage(img, 0, 0, img.width * ratio, img.height * ratio);

      //   Stage.value.getGround().add(canvas);

      //   isLoadingImg.value = false;

      console.log(`绘图完成`);
      console.timeEnd();
      e.target.files = null;
    };
  };
};

const downloadShareImg = () => {
  Stage.value
    .getStage()
    .export("早早传书.png")
    .then(() => {
      toast("已下载!", {
        type: "success",
        autoClose: 1500,
      });
    });
};
onMounted(() => {
  initByLeafer();
  isInited.value = true;
  //   setTimeout(() => {
  //     setCanvasContent();
  //   }, 100);
});
</script>

<template>
  <div
    class="content w-full h-full flex-1 justify-center items-center relative font-['DouYinMeiHao']"
    ref="viewContainer"
  >
    <div
      class="flex-1 shadow-neutral shadow-lg"
      :style="{
        width: `${frameWidth}px`,
        height: `${frameHeight}px`,
        left: '50%',
        top: '2rem',
        position: 'absolute',
        marginLeft: `-${frameWidth / 2}px`,
      }"
    >
      <div class="absolute w-200px left--200px top-4">
        <TextPicker
          v-if="isInited"
          v-model="shareContent"
          @updateHtmlText="updateContentText"
        ></TextPicker>
      </div>
      <div class="action-bar absolute left-380px top-4">
        <textarea
          v-model="shareTitle"
          class="textarea textarea-bordered h-24"
          placeholder="输入文字"
        ></textarea>
        <textarea
          v-model="shareAuthor"
          class="textarea textarea-bordered h-24"
          placeholder="输入文字"
        ></textarea>
        <!-- <textarea
          v-model="shareContent"
          class="textarea textarea-bordered h-24"
          placeholder="输入文字"
        ></textarea> -->
        <input
          class="hidden"
          type="file"
          ref="fileInput"
          @change="uploadFile"
        />
        <button class="btn btn-outline btn-primary" @click="openFileSelect">
          更换图片
        </button>
        <button class="btn btn-outline btn-primary" @click="downloadShareImg">
          下载图片
        </button>
      </div>
      <div
        ref="canvasContainerRef"
        id="canvasContainerRef"
        class="w-full h-full"
      ></div>
    </div>
  </div>
</template>
