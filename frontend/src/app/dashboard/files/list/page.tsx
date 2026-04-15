'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert, Spinner, Card, Form, Badge, Table } from '@/lib/react-bootstrap';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface File {
  id: number;
  filename: string;
  file_size: number;
  file_type: string;
  upload_date: string;
}

export default function FilesListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchFiles();
  }, [filter]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/files/list', {
        params: { filter },
      });
      setFiles(response.data.files || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="mt-4" fluid>
        <Spinner animation="border" />
      </Container>
    );
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return 'fa-file-pdf';
    if (fileType.includes('word') || fileType.includes('document')) return 'fa-file-word';
    if (fileType.includes('sheet') || fileType.includes('csv')) return 'fa-file-csv';
    if (fileType.includes('zip') || fileType.includes('archive')) return 'fa-file-archive';
    return 'fa-file';
  };

  return (
    <Container className="mt-4" fluid>
      <Row className="mb-4">
        <Col>
          <h1>File Library</h1>
        </Col>
        <Col xs="auto">
          <Button
            variant="success"
            onClick={() => router.push('/dashboard/files/upload')}
          >
            <i className="fa fa-upload"></i> Upload Files
          </Button>{' '}
          <Button variant="info" onClick={() => router.push('/dashboard/files/organize')}>
            <i className="fa fa-folder"></i> Organize
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Form.Group>
            <Form.Label>Filter Files</Form.Label>
            <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Files</option>
              <option value="documents">Documents</option>
              <option value="downloads">Downloads</option>
              <option value="archives">Archives</option>
              <option value="unused">Unused Files</option>
            </Form.Select>
          </Form.Group>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          {files.length === 0 ? (
            <Alert variant="info">No files found</Alert>
          ) : (
            <Table hover>
              <thead>
                <tr>
                  <th>Filename</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Upload Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id}>
                    <td>
                      <i className={`fa ${getFileIcon(file.file_type)}`}></i> {file.filename}
                    </td>
                    <td>
                      <Badge bg="info">{file.file_type}</Badge>
                    </td>
                    <td>{(file.file_size / 1024).toFixed(2)} KB</td>
                    <td>{file.upload_date}</td>
                    <td>
                      <Button
                        variant="sm"
                        className="me-1"
                        onClick={() =>
                          router.push(`/dashboard/files/edit/${file.id}`)
                        }
                      >
                        <i className="fa fa-edit"></i>
                      </Button>
                      <Button
                        variant="sm"
                        variant="danger"
                        onClick={() => {
                          if (confirm('Are you sure?')) {
                            deleteFile(file.id);
                          }
                        }}
                      >
                        <i className="fa fa-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

const deleteFile = async (fileId: number) => {
  try {
    await api.delete(`/files/${fileId}`);
    window.location.reload();
  } catch (err) {
    console.error('Failed to delete file');
  }
};
