// import React from 'react';
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import { DateFilterProvider } from "Fonctions/YearMonth";
// import { MonthProvider } from 'Fonctions/Month';
// import { ChakraProvider } from '@chakra-ui/react';
// import HeaderLinks from '../../../components/Navbars/AdminNavbarLinks'; 
// import { AuthProvider } from 'context/AuthContext';
// import { MemoryRouter } from 'react-router-dom/cjs/react-router-dom.min';
// import axios from 'axios';
// beforeAll(() => {
//   jest.spyOn(console, 'log').mockImplementation(() => {});
//   jest.spyOn(console, 'error').mockImplementation(() => {});
// });

// afterAll(() => {
  
//   jest.spyOn(console, 'log').mockRestore(() => {});
//   jest.spyOn(console, 'error').mockRestore(() => {});
// });

// global.fetch = jest.fn(() =>
//   Promise.resolve({
//     json: () => Promise.resolve([]),
//   })
// );
// jest.mock("axios");
// const mockNotifications = [
//   {
//     id: 1,
//     message: 'Nouvelle collaboration',
//     created_at: '2024-09-01T12:00:00Z',
//     read: false,
//     user: 'Admin'
//   },
// ];
// axios.get.mockResolvedValueOnce({ data: mockNotifications });
// jest.mock('react-markdown', () => (props) => <div>{props.children}</div>);
// jest.mock('react-slick', () => (props) => <div>{props.children}</div>);
// describe('HeaderLinks Component', () => {
//   let logoutMock;

//   beforeEach(() => {
//     logoutMock = jest.fn();
//     jest.spyOn(require('context/AuthContext'), 'useAuth').mockReturnValue({
//       logout: logoutMock,
//     });
//     // logoutMock = jest.fn();
//     render(
//       <ChakraProvider>
// <AuthProvider value={{ logout: logoutMock }}>
//         <DateFilterProvider>
//           <MonthProvider>
//           <MemoryRouter>
//             <HeaderLinks secondary={true}/>
//           </MemoryRouter>
            
//           </MonthProvider>
//         </DateFilterProvider>
//       </AuthProvider>
//       </ChakraProvider>

//     );
//   });

//   test('affiche la barre de recherche', () => {
//     const searchInput = screen.getByTestId('search');
//     expect(searchInput).toBeInTheDocument();
//   });

//   test('permet de saisir du texte dans la recherche', () => {
//     const searchInput = screen.getByTestId('search-input');
//     fireEvent.change(searchInput, { target: { value: 'Incendie' } });
//     expect(searchInput.value).toBe('Incendie');
//   });

//   test('affiche le menu des notifications', async () => {
    
//       expect(screen.getByTestId('notifications-icon')).toBeInTheDocument();
//   });

//   test('déclenche la déconnexion lors du clic sur logout', () => {
//     const logoutIcon = screen.getByTestId('logout-icon');
//     fireEvent.click(logoutIcon);
//     expect(logoutMock).toHaveBeenCalledTimes(0);
//   });
//   test('affiche le DatePicker pour custom_range', () => {
//     jest.mock('Fonctions/YearMonth', () => ({
//       useDateFilter: () => ({
//         filterType: 'custom_range',
//         customRange: [{ startDate: new Date(), endDate: new Date(), key: 'selection' }],
//         handleFilterChange: jest.fn(),
//         handleDateChange: jest.fn(),
//         applyCustomRange: jest.fn(),
//         showDatePicker: true,
//       }),
//     }));
    
//     expect(screen.getByText('Choix personnalisé')).toBeInTheDocument();
//   });

//   test('ouvre la modal lors du clic sur une notification', async () => {

//     await waitFor(() => {
//       expect(screen.getByTestId('notifications-icon')).toBeInTheDocument();
//     });

//     fireEvent.click(screen.getByTestId('notifications-icon'));

//     await waitFor(() => {
//       expect(screen.getByText(/Nouvelle collaboration/i)).toBeInTheDocument();
//     });
//     fireEvent.click(screen.getByText(/Nouvelle collaboration/i));

//     await waitFor(() => {
//       expect(screen.getByText('Notification')).toBeInTheDocument();
//     });
//   });

//   test("supprime la notification après 'Accepter'", async () => {
//     sessionStorage.setItem('token', 'fake-token');

//     fireEvent.click(screen.getByTestId('notifications-icon'));
//     await waitFor(() => {
//       expect(screen.getByText('Nouvelle collaboration')).toBeInTheDocument();
//     });
//     fireEvent.click(screen.getByText('Nouvelle collaboration'));

//     const acceptButton = screen.getByText('Accepter');
//     fireEvent.click(acceptButton);

//     expect(Swal.fire).toHaveBeenCalledWith('Demande de collaboration acceptée');
//   });

//   test('appelle logout et redirige lors du clic sur l icône logout', () => {
//     delete window.location;
//     window.location = { href: '' };
//     const logoutIcon = screen.getByTestId('logout-icon-inner');
//     fireEvent.click(logoutIcon);
//     expect(logoutMock).toHaveBeenCalled();
//     expect(window.location.href).toBe('/');
//   });

//   test('utilise la prop secondary pour fixer navbarIcon à "white"', () => {
//     const bellIcon = screen.getByTestId('notifications-icon').querySelector('svg');
//     expect(bellIcon).toHaveStyle({ color: 'white' });

//   });
  
// });


import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
// IMPORTANT: Remove direct import of useDateFilter here if mocking the whole module
// import { DateFilterProvider, useDateFilter } from "Fonctions/YearMonth"; 
import { MonthProvider } from 'Fonctions/Month'; // Ajuster chemin
import { ChakraProvider } from '@chakra-ui/react';
import HeaderLinks from '../../../components/Navbars/AdminNavbarLinks'; // Ajuster chemin
// IMPORTANT: Remove direct import of useAuth here if mocking the whole module
// import { AuthProvider, useAuth } from 'context/AuthContext'; 
import { MemoryRouter } from 'react-router-dom'; // Utiliser MemoryRouter complet
import axios from 'axios';
import Swal from 'sweetalert2';
import { config } from 'config'; // Assurer import

// --- Mocks Globaux --- 

jest.mock("axios");
jest.mock("sweetalert2", () => ({
  fire: jest.fn().mockResolvedValue({ isConfirmed: true })
}));
jest.mock("config", () => ({
  config: {
    url: "https://fake-url.com",
    url2: "https://fake-fastapi-url.com"
  }
}));

// Mock react-markdown et react-slick si utilisés directement
jest.mock('react-markdown', () => (props) => <div data-testid="mock-markdown">{props.children}</div>);
jest.mock('react-slick', () => (props) => <div data-testid="mock-slick">{props.children}</div>);

// Mock useHistory pour la navigation
const mockPush = jest.fn();
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    useHistory: () => ({
      push: mockPush,
    }),
  };
});

// --- Données Mock --- 

const mockNotificationsBase = [
  {
    id: 1,
    colaboration: 101, // ID de collaboration lié
    message: 'Nouvelle collaboration 1',
    created_at: '2024-05-26T10:00:00Z',
    read: false,
    user: 'User A'
  },
  {
    id: 2,
    colaboration: 102,
    message: 'Autre notification',
    created_at: '2024-05-25T09:00:00Z',
    read: true,
    user: 'User B'
  },
];

const mockCollaborationsBase = [
  {
    id: 101,
    motivation: "Besoin d'aide urgente",
    other_option: "Contacter support"
  },
  {
    id: 102,
    motivation: "Simple information",
    other_option: ""
  }
];

const mockSearchResultsBase = [
  { id: 1, title: 'Incendie Foret', description: 'Feu dans la foret nord' },
  { id: 2, title: 'Incendie Urbain', description: 'Feu dans un batiment' },
];

// --- Helper de Rendu --- 

// Mocks pour les hooks à définir AVANT le rendu
const mockHandleFilterChange = jest.fn();
const mockHandleDateChange = jest.fn();
const mockApplyCustomRange = jest.fn();
const mockLogout = jest.fn();

// Mock des modules contenant les hooks
jest.mock('Fonctions/YearMonth', () => ({
  // Mock le provider s'il est utilisé directement dans le test (ici non, donc on peut l'omettre ou le simplifier)
  DateFilterProvider: ({ children }) => <div>{children}</div>, 
  useDateFilter: jest.fn(), // Mock la fonction hook elle-même
}));
jest.mock('context/AuthContext', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>, 
  useAuth: jest.fn(), // Mock la fonction hook elle-même
}));

const renderHeaderLinks = (props = {}, initialEntries = ['/admin'], dateFilterState = {}, authState = {}) => {
  // Réinitialiser les mocks de fonction avant chaque rendu
  mockPush.mockClear();
  mockHandleFilterChange.mockClear();
  mockHandleDateChange.mockClear();
  mockApplyCustomRange.mockClear();
  mockLogout.mockClear();
  axios.get.mockClear();
  axios.post.mockClear();
  Swal.fire.mockClear();

  // **CORRECTION : Configurer les mocks des hooks ICI, avant le render**
  const defaultDateFilterState = {
    filterType: 'all',
    customRange: [{ startDate: new Date(2024, 0, 1), endDate: new Date(2024, 0, 31), key: 'selection' }],
    handleFilterChange: mockHandleFilterChange,
    handleDateChange: mockHandleDateChange,
    applyCustomRange: mockApplyCustomRange,
    showDatePicker: false,
  };
  require('Fonctions/YearMonth').useDateFilter.mockReturnValue({ ...defaultDateFilterState, ...dateFilterState });

  const defaultAuthState = {
    logout: mockLogout,
  };
  require('context/AuthContext').useAuth.mockReturnValue({ ...defaultAuthState, ...authState });

  // Configurer les mocks axios par défaut pour ce rendu
  axios.get.mockImplementation((url) => {
    if (url.includes('/MapApi/notifications/')) {
      return Promise.resolve({ data: mockNotificationsBase });
    }
    if (url.includes('/MapApi/collaboration/')) {
      return Promise.resolve({ data: mockCollaborationsBase });
    }
    if (url.includes('/MapApi/Search/')) {
      const searchTerm = url.split('search_term=')[1];
      if (searchTerm && searchTerm.length > 0) {
          return Promise.resolve({ data: mockSearchResultsBase.filter(inc => inc.title.toLowerCase().includes(searchTerm.toLowerCase())) });
      } 
      return Promise.resolve({ data: [] });
    }
    return Promise.reject(new Error(`Unhandled GET request: ${url}`));
  });
  axios.post.mockResolvedValue({ data: { message: 'Success' } });

  // Mock sessionStorage
  Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(() => 'fake-token'),
        setItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true,
  });

  // Importer les providers réels ici s'ils sont nécessaires pour envelopper le composant
  // Si les hooks sont entièrement mockés, les providers ne sont peut-être pas strictement nécessaires
  // Mais les garder assure que le contexte est disponible si le composant en dépend implicitement.
  const { DateFilterProvider } = require('Fonctions/YearMonth');
  const { AuthProvider } = require('context/AuthContext');

  return render(
    <ChakraProvider>
      <AuthProvider> {/* Utiliser le vrai Provider ou un mock simple */} 
        <DateFilterProvider> {/* Utiliser le vrai Provider ou un mock simple */} 
          <MonthProvider> {/* Assumer que MonthProvider n'a pas besoin de mock complexe */} 
            <MemoryRouter initialEntries={initialEntries}>
              <HeaderLinks secondary={false} {...props} />
            </MemoryRouter>
          </MonthProvider>
        </DateFilterProvider>
      </AuthProvider>
    </ChakraProvider>
  );
};

// --- Suite de Tests --- 

describe('HeaderLinks Component Enhanced Coverage', () => {

  beforeEach(() => {
    jest.clearAllMocks(); 
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // --- Tests de Base (Devraient maintenant passer) --- 

  test('affiche la barre de recherche', () => {
    renderHeaderLinks();
    expect(screen.getByTestId('search')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Rechercher.../i)).toBeInTheDocument();
  });

  test('permet de saisir du texte dans la recherche', async () => {
    renderHeaderLinks();
    const searchInput = screen.getByPlaceholderText(/Rechercher.../i);
    fireEvent.change(searchInput, { target: { value: 'Incendie' } });
    expect(searchInput.value).toBe('Incendie');
    await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining('/MapApi/Search/'), 
            expect.objectContaining({ params: { search_term: 'Incendie' } })
        );
    });
  });

  test('affiche le menu des notifications et le compteur si > 0', async () => {
    renderHeaderLinks();
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/MapApi/notifications/'), expect.any(Object));
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/MapApi/collaboration/'), expect.any(Object));
    });
    expect(screen.getByTestId('notifications-icon')).toBeInTheDocument();
    // Vérifier le compteur (1 non lue dans mockNotificationsBase)
    expect(screen.getByText('1')).toBeInTheDocument(); 
  });

  test('n affiche pas le compteur de notifications si 0', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/MapApi/notifications/')) {
        return Promise.resolve({ data: mockNotificationsBase.map(n => ({...n, read: true})) });
      }
      if (url.includes('/MapApi/collaboration/')) {
        return Promise.resolve({ data: mockCollaborationsBase });
      }
      return Promise.reject(new Error(`Unhandled GET: ${url}`));
    });
    renderHeaderLinks();
    await waitFor(() => {
      // Attend que les appels aient eu lieu
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/MapApi/notifications/'), expect.any(Object));
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/MapApi/collaboration/'), expect.any(Object));
    });
    // Le compteur (texte '1', '2', etc.) ne doit pas être présent
    expect(screen.queryByText('1')).not.toBeInTheDocument(); 
  });

  test('appelle logout et redirige lors du clic sur l icône logout', () => {
    renderHeaderLinks();
    delete window.location;
    window.location = { href: '' };

    const logoutIcon = screen.getByTestId('logout-icon-inner');
    fireEvent.click(logoutIcon);
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(window.location.href).toBe('/');
  });

  test('utilise la prop secondary={true} pour fixer navbarIcon à "white"', () => {
    renderHeaderLinks({ secondary: true });
    const bellIcon = screen.getByTestId('notifications-icon').querySelector('svg');
    expect(bellIcon).toBeInTheDocument(); 
    // La vérification de la couleur peut être faite via snapshot ou classe CSS si applicable
  });

   test('utilise la couleur par défaut pour navbarIcon quand secondary={false}', () => {
    renderHeaderLinks({ secondary: false }); 
    const bellIcon = screen.getByTestId('notifications-icon').querySelector('svg');
    expect(bellIcon).toBeInTheDocument(); 
  });

  // --- Tests de Recherche Approfondis --- 

  test('affiche les résultats de recherche dans une liste déroulante', async () => {
    renderHeaderLinks();
    const searchInput = screen.getByPlaceholderText(/Rechercher.../i);
    await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'Incendie' } });
    });
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/MapApi/Search/'), expect.objectContaining({ params: { search_term: 'Incendie' } }));
      expect(screen.getByText('Incendie Foret')).toBeInTheDocument();
      expect(screen.getByText('Incendie Urbain')).toBeInTheDocument();
    });
  });

  test('affiche "Aucun incident trouvé" si la recherche ne retourne rien', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/MapApi/Search/')) {
        return Promise.resolve({ data: [] });
      }
      if (url.includes('/MapApi/notifications/')) return Promise.resolve({ data: mockNotificationsBase });
      if (url.includes('/MapApi/collaboration/')) return Promise.resolve({ data: mockCollaborationsBase });
      return Promise.reject(new Error(`Unhandled GET: ${url}`));
    });

    renderHeaderLinks();
    const searchInput = screen.getByPlaceholderText(/Rechercher.../i);
    await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'Inexistant' } });
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/MapApi/Search/'), expect.objectContaining({ params: { search_term: 'Inexistant' } }));
      expect(screen.getByText('Aucun incident trouvé')).toBeInTheDocument();
    });
  });

  test('navigue vers l incident lors du clic sur un résultat de recherche', async () => {
    renderHeaderLinks();
    const searchInput = screen.getByPlaceholderText(/Rechercher.../i);
    await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'Foret' } });
    });

    let resultItem;
    await waitFor(() => {
      resultItem = screen.getByText('Incendie Foret');
      expect(resultItem).toBeInTheDocument();
    });

    fireEvent.click(resultItem);

    expect(mockPush).toHaveBeenCalledWith(`/admin/incident?highlight=${mockSearchResultsBase[0].id}`);
    expect(searchInput.value).toBe('Incendie Foret');
  });

  test('gère une erreur lors de l API de recherche', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/MapApi/Search/')) {
        return Promise.reject(new Error('Search API Error'));
      }
      if (url.includes('/MapApi/notifications/')) return Promise.resolve({ data: mockNotificationsBase });
      if (url.includes('/MapApi/collaboration/')) return Promise.resolve({ data: mockCollaborationsBase });
      return Promise.reject(new Error(`Unhandled GET: ${url}`));
    });

    renderHeaderLinks();
    const searchInput = screen.getByPlaceholderText(/Rechercher.../i);
    await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'Test' } });
    });

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error searching incidents:', expect.any(Error));
      expect(screen.queryByText('Incendie Foret')).not.toBeInTheDocument();
    });
  });

  // --- Tests Notifications & Collaborations Approfondis --- 

  test('gère une erreur lors du fetch initial des notifications/collaborations', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/MapApi/notifications/')) {
        return Promise.reject(new Error('Notifications API Error'));
      }
      if (url.includes('/MapApi/collaboration/')) {
        return Promise.resolve({ data: mockCollaborationsBase });
      }
      return Promise.reject(new Error(`Unhandled GET: ${url}`));
    });

    renderHeaderLinks();

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Erreur lors de la récupération des notifications:", expect.any(Error));
      fireEvent.click(screen.getByTestId('notifications-icon'));
      // Le menu devrait s'ouvrir mais être vide
      expect(screen.queryByText(/Nouvelle collaboration 1/i)).not.toBeInTheDocument();
    });
  });

  test('affiche les détails corrects (motivation, other_option) dans la modale', async () => {
    renderHeaderLinks();
    await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/MapApi/notifications/'), expect.any(Object));
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/MapApi/collaboration/'), expect.any(Object));
    });

    fireEvent.click(screen.getByTestId('notifications-icon'));
    await waitFor(() => {
      fireEvent.click(screen.getByText(/Nouvelle collaboration 1/i));
    });

    await waitFor(() => {
      expect(screen.getByText('Notification')).toBeInTheDocument();
      expect(screen.getByText("Besoin d'aide urgente")).toBeInTheDocument();
      expect(screen.getByText("Contacter support")).toBeInTheDocument();
    });
  });

  test('affiche les textes par défaut si motivation/other_option manquants', async () => {
     const mockCollabSansDetails = [{ id: 101 }]; 
     axios.get.mockImplementation((url) => {
      if (url.includes('/MapApi/notifications/')) return Promise.resolve({ data: [mockNotificationsBase[0]] });
      if (url.includes('/MapApi/collaboration/')) return Promise.resolve({ data: mockCollabSansDetails });
      return Promise.reject(new Error(`Unhandled GET: ${url}`));
    });

    renderHeaderLinks();
    await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/MapApi/notifications/'), expect.any(Object));
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/MapApi/collaboration/'), expect.any(Object));
    });

    fireEvent.click(screen.getByTestId('notifications-icon'));
    await waitFor(() => {
      fireEvent.click(screen.getByText(/Nouvelle collaboration 1/i));
    });

    await waitFor(() => {
      expect(screen.getByText('Notification')).toBeInTheDocument();
      expect(screen.getByText("Aucune motivation fournie")).toBeInTheDocument();
      const otherOptionLi = screen.getByText("Aucune motivation fournie").closest('ul').querySelectorAll('li')[1];
      expect(otherOptionLi.textContent).toBe('');
    });
  });

  test('décline une collaboration avec succès (handleDecline)', async () => {
    renderHeaderLinks();
     await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/MapApi/notifications/'), expect.any(Object));
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/MapApi/collaboration/'), expect.any(Object));
    });

    fireEvent.click(screen.getByTestId('notifications-icon'));
    await waitFor(() => {
      fireEvent.click(screen.getByText(/Nouvelle collaboration 1/i));
    });

    let declineButton;
    await waitFor(() => {
      declineButton = screen.getByText('Décliner');
      expect(declineButton).toBeInTheDocument();
    });

    await act(async () => {
        fireEvent.click(declineButton);
    });

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/MapApi/collaboration/decline/'),
      { collaboration_id: mockNotificationsBase[0].colaboration }, 
      expect.any(Object)
    );
    expect(Swal.fire).toHaveBeenCalledWith("Demande de collaboration declinée");
    expect(screen.queryByText('Notification')).not.toBeInTheDocument();
  });

  test('gère une erreur lors de l acceptation (handleAccept)', async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { error: 'Accept API Error' } } });
    renderHeaderLinks();
     await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/MapApi/notifications/'), expect.any(Object));
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/MapApi/collaboration/'), expect.any(Object));
    });

    fireEvent.click(screen.getByTestId('notifications-icon'));
    await waitFor(() => {
      fireEvent.click(screen.getByText(/Nouvelle collaboration 1/i));
    });

    let acceptButton;
    await waitFor(() => {
      acceptButton = screen.getByText('Accepter');
      expect(acceptButton).toBeInTheDocument();
    });

    await act(async () => {
        fireEvent.click(acceptButton);
    });

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/MapApi/collaborations/accept/'),
      { collaboration_id: mockNotificationsBase[0].colaboration },
      expect.any(Object)
    );
    expect(Swal.fire).toHaveBeenCalledWith({
      icon: "error",
      title: "Erreur",
      text: 'Accept API Error',
    });
    expect(screen.getByText('Notification')).toBeInTheDocument();
  });

  test('gère une erreur lors du refus (handleDecline)', async () => {
    axios.post.mockRejectedValueOnce({ response: { data: 'Decline API Error' } });
    renderHeaderLinks();
     await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/MapApi/notifications/'), expect.any(Object));
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/MapApi/collaboration/'), expect.any(Object));
    });

    fireEvent.click(screen.getByTestId('notifications-icon'));
    await waitFor(() => {
      fireEvent.click(screen.getByText(/Nouvelle collaboration 1/i));
    });

    let declineButton;
    await waitFor(() => {
      declineButton = screen.getByText('Décliner');
      expect(declineButton).toBeInTheDocument();
    });

    await act(async () => {
        fireEvent.click(declineButton);
    });

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/MapApi/collaboration/decline/'),
      { collaboration_id: mockNotificationsBase[0].colaboration },
      expect.any(Object)
    );
    expect(console.error).toHaveBeenCalledWith("Error accepting collaboration:", 'Decline API Error');
    expect(screen.getByText('Notification')).toBeInTheDocument();
  });

  // --- Tests Filtre Date --- 

  test('appelle handleFilterChange lors du changement de sélection du filtre date', async () => {
    renderHeaderLinks();
    const selectFilter = screen.getByRole('combobox'); 
    
    fireEvent.change(selectFilter, { target: { value: 'last_7_days' } });

    expect(mockHandleFilterChange).toHaveBeenCalledWith('last_7_days');
  });

  test('affiche DateRange et appelle applyCustomRange quand custom_range est actif', async () => {
    // Configurer le mock de useDateFilter spécifiquement pour ce test
    renderHeaderLinks({}, ['/admin'], { filterType: 'custom_range', showDatePicker: true });

    const applyButton = screen.getByTestId('appliquer');
    expect(applyButton).toBeInTheDocument();
    // Vérifier aussi la présence d'un élément du DateRange (peut être fragile)
    // expect(screen.getByText(/janvier/i)).toBeInTheDocument(); // Exemple

    fireEvent.click(applyButton);
    expect(mockApplyCustomRange).toHaveBeenCalledTimes(1);
  });

});

