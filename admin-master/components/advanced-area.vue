<template>
  <div style="position: relative">
    <slot></slot>
    <editor
      v-model="dataValue"
      api-key="li7g9fy4wvrnb2874nyqzt5pd95m23zsazu9fu3p0hgw25et"
      :init="{
         height: height ? height : 500,
         menubar: false,
         statusbar: false,
         plugins: [
           'lists', 'link', 'image'
         ],
         toolbar: 'bold | italic | underline | fontsizeselect | bullist | numlist | link | blockquote | image | removeformat',
         contextmenu: false,
        images_upload_handler: uploadHandler
       }"
    />
  </div>
</template>

<script>
import Editor from '@tinymce/tinymce-vue'

export default {
  name: "advanced-area",
  components: {'editor': Editor},
  props: ['value', 'height'],
  watch: {
    value(val) {
      this.dataValue = val;
    },
    dataValue(val) {
      console.log('so show')
      console.log(val)
      this.$emit('input', val)
    }
  },
  methods: {
    async uploadHandler(blobInfo, success, failure, progress) {
      try {
        const formData = new FormData();
        formData.append('file', blobInfo.blob());
        const response = await this.$axios.$post('/api/file',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress(event) {
              progress(event.loaded / event.total * 100);
            }
          }
        );
        success('/api/file/' + response.fileId)
      } catch (e) {
        failure('Ошибка при загрузке')
      }
    }
  },
  data() {
    return {
      dataValue: ''
    }
  },
  mounted() {
    this.dataValue = this.value
  }
}
</script>

<style scoped>

</style>
