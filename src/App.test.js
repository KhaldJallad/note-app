import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

const mockGet = jest.fn();
const mockPost = jest.fn();

jest.mock('axios', () => ({
  create: () => ({
    get: (...args) => mockGet(...args),
    post: (...args) => mockPost(...args)
  })
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockGet.mockResolvedValue({ data: [] });
  mockPost.mockResolvedValue({ data: { message: 'Success' } });
});

test('loads and displays the empty notes state', async () => {
  render(<App />);
  expect(await screen.findByText(/No notes yet/i)).toBeInTheDocument();
  expect(mockGet).toHaveBeenCalledWith('/notes');
});

test('submits a new note through the API', async () => {
  render(<App />);
  await screen.findByText(/No notes yet/i);
  fireEvent.click(screen.getByRole('button', { name: /Add Note/i }));
  fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'My note' } });
  fireEvent.change(screen.getByLabelText('Content'), { target: { value: 'Some content' } });
  fireEvent.click(screen.getByRole('button', { name: /Save Note/i }));

  await waitFor(() => {
    expect(mockPost).toHaveBeenCalledWith('/insert', {
      title: 'My note',
      content: 'Some content'
    });
  });
});
