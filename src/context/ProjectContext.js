import { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/api';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = async (title, description) => {
    const res = await api.post('/projects', { title, description });
    setProjects(prev => [res.data, ...prev]);
    return res.data;
  };

  const deleteProject = async (id) => {
    await api.delete(`/projects/${id}`);
    setProjects(prev => prev.filter(p => p._id !== id));
  };

  return (
    <ProjectContext.Provider value={{ projects, loading, fetchProjects, createProject, deleteProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => useContext(ProjectContext);