import { Modal } from "antd";
import ButtonCore from "@/components/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useAppStore } from "../../stores";

const NotiAuth = () => {
  const { notiAuth, toggleNotiAuth } = useAppStore();

  const onClose = () => {
    toggleNotiAuth(false);
  };

  return (
    <Modal
      open={notiAuth}
      footer={null}
      title={null}
      centered
      destroyOnHidden={true}
      closable={false}
      className="flex flex-col justify-center items-center"
    >
      <div className="flex justify-end w-full">
        <ButtonCore onClick={onClose} variant="bg-transparent" className="p-2">
          <FontAwesomeIcon icon={faXmark} size="lg" />
        </ButtonCore>
      </div>
      <h3 className="text-2xl font-bold mb-3 text-center">Thông báo</h3>
      <p className="text-sm mb-6 text-center">
        Vui lòng đăng nhập để sử dụng tính năng này
      </p>
      <div className="flex gap-4">
        <ButtonCore className="flex-1">Đăng nhập</ButtonCore>
        <ButtonCore variant="outline" className="flex-1">
          Đăng ký
        </ButtonCore>
      </div>
    </Modal>
  );
};
export default NotiAuth;
