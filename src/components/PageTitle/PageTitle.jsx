import { useEffect } from "react";

const PageTitle1 = ({ title }) => {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return null;
};

const PageTitle = ({ title, description, keywords }) => {
  useEffect(() => {
    // 1. Cập nhật Title
    if (title) document.title = title;

    const updateMeta = (name, content, isProperty = false) => {
      if (!content) return;
      const selector = isProperty
        ? `meta[property="${name}"]`
        : `meta[name="${name}"]`;
      let meta = document.querySelector(selector);
      if (meta) {
        meta.setAttribute("content", content);
      } else {
        meta = document.createElement("meta");
        if (isProperty) meta.setAttribute("property", name);
        else meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    // 2. Các thẻ Meta cơ bản
    updateMeta("description", description);
    updateMeta("keywords", keywords);

    // 3. Social Media (Open Graph - Để share link đẹp)
    updateMeta("og:title", title, true);
    updateMeta("og:description", description, true);
    updateMeta("og:type", "website", true);
    updateMeta("twitter:card", "summary_large_image");
  }, [title, description, keywords]);

  return null;
};

const PageTitle2 = ({ title, description }) => {
  useEffect(() => {
    // 1. Cập nhật Title
    if (title) {
      document.title = title;
    }

    // 2. Cập nhật Meta Description
    if (description) {
      // Tìm thẻ meta description hiện có
      let metaDescription = document.querySelector('meta[name="description"]');

      if (metaDescription) {
        // Nếu đã có thì cập nhật content
        metaDescription.setAttribute("content", description);
      } else {
        // Nếu chưa có thì tạo mới và chèn vào head
        metaDescription = document.createElement("meta");
        metaDescription.name = "description";
        metaDescription.content = description;
        document.head.appendChild(metaDescription);
      }
    }
  }, [title, description]);

  return null;
};

export default PageTitle;
