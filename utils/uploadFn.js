import config from '@config/config';
import Taro from '@tarojs/taro';

// 服务器地址
const uploadUrl = `${config.apiUrl}/fileUpload` 

export default async function uploadFn(fileList) {
  if (!Array.isArray(fileList) || (Array.isArray(fileList) && fileList.length == 0)) {
    return [];
  }

  let hasCancle = false;

  const tmpPromise = () => {
    let counter = 0;
    let tmpUrlArray = [];
    return new Promise((resolve, reject) => {
      const fetchFN = () => {
        if (hasCancle) {
          return;
        }

        const url = fileList[counter].url || fileList[counter];
        console.log('url!!', url);
        Taro.showLoading({
          title: `上传中(${counter + 1}/${fileList.length})`,
          mask: true,
        });
        const handleFn = (urlRes) => {
          console.log(urlRes)
          if (hasCancle) {
            reject(1);
            return;
          } else if (urlRes) {
            tmpUrlArray.push(urlRes);
            counter++;
            if (counter < fileList.length) {
              fetchFN();
            } else {
              console.log('tmpUrlArray!!', tmpUrlArray);
              resolve(tmpUrlArray);
            }
          }
        };

        if (url.indexOf('weixin-voice') > -1) {
          handleFn(url);
        } else {
          // 走这一步
          Taro.uploadFile({
            url: uploadUrl,
            filePath: url,
            name: 'file',
            success(res) {
              console.log('uploadFile res',res.statusCode==413 , res);
              if(res.statusCode==413){
                console.log(6666000)
                reject('图片太大了，请先压缩');
                return
              }
              const response = JSON.parse(res.data);
              console.log('res!!!', response);
              if (response && res.statusCode == '200' && response.code == 0) {
                console.log(88888)
                handleFn(response.data.link);
              } else {
                reject(response.errMsg);
              }
            },
            fail(e) {
              console.error('e00000!', e);
              // 再试一次
              Taro.showModal({
                title: '上传时间有点久？',
                content: '是否再次上传这一张？',
                confirmText: '取消上传',
                cancelText: '再次上传',
                success(res) {
                  // console.log(res.confirm, res.cancel);
                  if (res.confirm) { // 取消
                    hasCancle = true;
                    handleFn();
                  } else if (res.cancel) {
                    // 重新打开
                    fetchFN();
                  }
                },
              });
              // reject();
            },
          });
        }
      };
      fetchFN();
    });
  };
  let resolveFn = '';
  tmpPromise()
    .then((urlArray) => {
      // hasFinish = true;
      Taro.hideLoading();
      Taro.showToast({
        title: '上传成功',
        icon: 'success',
        duration: 1000,
      });
      // console.log('上传成功', urlArray);
      resolveFn(urlArray);
    })
    .catch((reason) => {
      console.log('reason', reason);
      Taro.hideLoading();
      Taro.showToast({
        title: reason === 1 ? '取消上传' : reason || '上传失败',
        icon: 'none',
        duration: 1500,
      });
      resolveFn([]);
    });

  return new Promise((resolve) => {
    resolveFn = resolve;
  });
}
