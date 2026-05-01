import { useAuth } from "../../contexts/AuthContext";

export default function Home() {
  const { isLoggedIn, user } = useAuth();

  console.log("user: ", user);

  return (
    <div style={{ borderRadius: "12px" }}>
      <h1>Chào Tú! Đây là nội dung trang chủ.</h1>
      <p>
        Nếu ông thấy dòng này nằm cạnh Sidebar thì ông đã thành công. Nếu ông
        thấy dòng này nằm cạnh Sidebar thì ông đã thành công. Nếu ông thấy dòng
        này nằm cạnh Sidebar thì ông đã thành công. Nếu ông thấy dòng này nằm
        cạnh Sidebar thì ông đã thành công. Nếu ông thấy dòng này nằm cạnh
        Sidebar thì ông đã thành công. Nếu ông thấy dòng này nằm cạnh Sidebar
        thì ông đã thành công. Nếu ông thấy dòng này nằm cạnh Sidebar thì ông đã
        thành công. Nếu ông thấy dòng này nằm cạnh Sidebar thì ông đã thành
        công. Nếu ông thấy dòng này nằm cạnh Sidebar thì ông đã thành công. Nếu
        ông thấy dòng này nằm cạnh Sidebar thì ông đã thành công. Nếu ông thấy
        dòng này nằm cạnh Sidebar thì ông đã thành công. Nếu ông thấy dòng này
        nằm cạnh Sidebar thì ông đã thành công. Nếu ông thấy dòng này nằm cạnh
        Sidebar thì ông đã thành công. Nếu ông thấy dòng này nằm cạnh Sidebar
        thì ông đã thành công. Nếu ông thấy dòng này nằm cạnh Sidebar thì ông đã
        thành công. Nếu ông thấy dòng này nằm cạnh Sidebar thì ông đã thành
        công. Nếu ông thấy dòng này nằm cạnh Sidebar thì ông đã thành công. Nếu
        ông thấy dòng này nằm cạnh Sidebar thì ông đã thành công. Nếu ông thấy
        dòng này nằm cạnh Sidebar thì ông đã thành công. Nếu ông thấy dòng này
        nằm cạnh Sidebar thì ông đã thành công. Nếu ông thấy dòng này nằm cạnh
        Sidebar thì ông đã thành công. Nếu ông thấy dòng này nằm cạnh Sidebar
        thì ông đã thành công. Nếu ông thấy dòng này nằm cạnh Sidebar thì ông đã
        thành công. Nếu ông thấy dòng này nằm cạnh Sidebar thì ông đã thành
        công.
      </p>
    </div>
  );
}
