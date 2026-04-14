'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert, Spinner, Card, Form, Badge, Table } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Image {
  id: number;
  filename: string;
  file_size: number;
  upload_date: string;
  width: number;
  height: number;
}

export default function ImagesListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchImages();
  }, [filter]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/images/list', {
        params: { filter },
      });
      setImages(response.data.images || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch images');
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

  return (
    <Container className="mt-4" fluid>
      <Row className="mb-4">
        <Col>
          <h1>Image Library</h1>
        </Col>
        <Col xs="auto">
          <Button
            variant="success"
            onClick={() => router.push('/dashboard/images/upload')}
          >
            <i className="fa fa-upload"></i> Upload Images
          </Button>{' '}
          <Button variant="info" onClick={() => router.push('/dashboard/images/organize')}>
            <i className="fa fa-folder"></i> Organize
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Form.Group>
            <Form.Label>Filter Images</Form.Label>
            <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Images</option>
              <option value="unused">Unused Images</option>
              <option value="products">Product Images</option>
              <option value="categories">Category Images</option>
              <option value="templates">Template Images</option>
            </Form.Select>
          </Form.Group>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          {images.length === 0 ? (
            <Alert variant="info">No images found</Alert>
          ) : (
            <Table hover>
              <thead>
                <tr>
                  <th>Filename</th>
                  <th>Size</th>
                  <th>Dimensions</th>
                  <th>Upload Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {images.map((image) => (
                  <tr key={image.id}>
                    <td>
                      <i className="fa fa-image"></i> {image.filename}
                    </td>
                    <td>{(image.file_size / 1024).toFixed(2)} KB</td>
                    <td>
                      {image.width}x{image.height}
                    </td>
                    <td>{image.upload_date}</td>
                    <td>
                      <Button
                        variant="sm"
                        className="me-1"
                        onClick={() =>
                          router.push(`/dashboard/images/edit/${image.id}`)
                        }
                      >
                        <i className="fa fa-edit"></i>
                      </Button>
                      <Button
                        variant="sm"
                        variant="danger"
                        onClick={() => {
                          if (confirm('Are you sure?')) {
                            deleteImage(image.id);
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

const deleteImage = async (imageId: number) => {
  try {
    await api.delete(`/images/${imageId}`);
    window.location.reload();
  } catch (err) {
    console.error('Failed to delete image');
  }
};
