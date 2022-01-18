/* 判断是否选中文字 */
export function getSelected() {
  if (window.getSelection) {
    return window.getSelection().toString()
  } else if (document.getSelection) {
    return document.getSelection().toString()
  } else {
    const selection = document.selection && document.selection.createRange()
    if (selection.text) {
      return selection.text.toString()
    }
    return ''
  }
}
