import { useEffect, useState } from "react";
import { BackendSubject, CatalogCourse, getLegacyCatalogCourses, mergeCatalogCourses } from "@/lib/catalog";

export const useCatalogCourses = () => {
  const [courses, setCourses] = useState<CatalogCourse[]>(getLegacyCatalogCourses());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/subjects", {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (res.ok) {
          const subjects = await res.json() as BackendSubject[];
          setCourses(mergeCatalogCourses(subjects));
        } else {
          setCourses(getLegacyCatalogCourses());
        }
      } catch {
        setCourses(getLegacyCatalogCourses());
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return { courses, loading };
};
