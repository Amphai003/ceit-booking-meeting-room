import React, { useEffect, useState } from 'react';
import EquipmentForm from '../component/EquipmentForm';
import EquipmentList from '../component/EquipmentList';
import api from '../../api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';


const EquipmentPage = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const navigate = useNavigate();

  const fetchEquipment = async () => {
    try {
      const response = await api.get('/equipment');
      setEquipmentList(response.data);
    } catch (err) {
      Swal.fire('Error', 'Failed to load equipment', 'error');
    }
  };

  const handleCreateOrUpdate = async (data) => {
    try {
      if (editItem) {
        await api.put(`/equipment/${editItem._id}`, data);
        Swal.fire('Updated!', 'Equipment updated successfully.', 'success');
      } else {
        await api.post('/equipment', data);
        Swal.fire('Created!', 'New equipment added.', 'success');
      }
      fetchEquipment();
      setEditItem(null);
    } catch (err) {
      Swal.fire('Error', 'Operation failed', 'error');
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Delete?',
      text: 'Are you sure you want to delete this item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/equipment/${id}`);
        fetchEquipment();
        Swal.fire('Deleted!', 'Equipment has been deleted.', 'success');
      } catch (err) {
        Swal.fire('Error', 'Delete failed', 'error');
      }
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back
        </button>
        <h1 className="text-xl font-semibold text-gray-800">Equipment Management</h1>
        <div />
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">
            {editItem ? 'Edit Equipment' : 'Add New Equipment'}
          </h2>
          <EquipmentForm onSubmit={handleCreateOrUpdate} initialData={editItem} />
        </section>

        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold mb-4">Equipment List</h2>
          <EquipmentList
            items={equipmentList}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </section>
      </main>
    </div>
  );
};

export default EquipmentPage;