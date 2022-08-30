
import uploadFile from "@utils/uploadFn";

// 观察者
@inject("globalData")
@observer
class Exposure extends Component {
  state = {

    imgFiles: [],
  };


  deleteImg = (index) => () => {
    console.log(index);
    const { imgFiles } = this.state;
    imgFiles.splice(index, 1);
    this.setState({
      imgFiles: [...imgFiles],
    });
  };

  onPreviewImage = (item) => () => {
    const { imgFiles } = this.state;
    Taro.previewImage({
      current: item, // 当前显示图片的http链接
      urls: imgFiles, // 需要预览的图片http链接列表
    });
  };

  render() {
    const {imgFiles } = this.state;

    return (
      <View className="exposure-container">
        <View className="exposure_top">
          <View className="top_media">
            <View className="img">
              {imgFiles.map((item, index) => {
                return (
                  <View className="box-wrap" key={item}>
                    <Image
                      className="box"
                      onClick={this.onPreviewImage(item)}
                      src={item}
                    ></Image>
                    <View className="close" onClick={this.deleteImg(index)}>
                      x
                    </View>
                  </View>
                );
              })}
              {imgFiles.length < 6 && (
                <View className="box" onClick={this.getImgFile.bind(this)}>
                  <Image
                    className="box-img1"
                    mode="widthFix"
                    src={require("@assets/icons/8.png")}
                  ></Image>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  }
}

export default Exposure;
