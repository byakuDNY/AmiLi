<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use App\Models\Tag;
use App\Models\Type;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class ListingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // if ($request->has('search')) {
        //     $search = $request->get('search');
        //     $listings->where(function($q) use ($search) {
        //         $q->where('name', 'like', "%{$search}%")
        //         ->orWhere('author', 'like', "%{$search}%");
        //     });
        // }


        return Inertia::render('Listings/index', [
            'listings' => Listing::with(['tags', 'type'])->where('user_id', Auth::id())
            // ->orderBy('updated_at', 'desc')
            ->latest()
            ->get()
            // 'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Listings/create', [
            'availableTags' => Tag::orderBy('name')->get(),
            'availableTypes' => Type::orderBy('name')->get()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'author' => 'nullable|string|max:255',
            'type_id' => 'required|exists:types,id',
            'imageUrl' => 'nullable|url|max:255',
            'link' => 'nullable|url|max:255',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id'
        ]);

        $validated['user_id'] = Auth::id();

        $tags = $validated['tags'] ?? [];

        DB::transaction(function () use ($validated, $tags) {
            $listing = Listing::create($validated);
            $listing->tags()->sync($tags);
        });

        return redirect()->route('listings.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Listing $listing)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Listing $listing)
    {
        // Ensure user can only edit their own listings
        if ($listing->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        return Inertia::render('Listings/edit', [
            'listing' => $listing->load(['tags', 'type']),
            'availableTags' => Tag::orderBy('name')->get(),
            'availableTypes' => Type::orderBy('name')->get()
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Listing $listing)
    {
        // Ensure user can only update their own listings
        if ($listing->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'author' => 'nullable|string|max:255',
            'type_id' => 'required|exists:types,id',
            'imageUrl' => 'nullable|url|max:255',
            'link' => 'nullable|url|max:255',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id'
        ]);

        $tags = $validated['tags'] ?? [];

        DB::transaction(function () use ($validated, $tags, $listing) {
            $listing->update($validated);
            $listing->tags()->sync($tags);
        });

        return redirect()->route('listings.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Listing $listing)
    {
        // Ensure user can only delete their own listings
        if ($listing->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        $listing->delete();
        return redirect()->route('listings.index');
    }

    public function bulkCreate()
    {
        return Inertia::render('Listings/bulk-create');
    }

    public function storeBulk(Request $request)
    {
        $request->validate([
            'listingsData' => 'required|string',
        ]);
    
        try {
            $listingsData = json_decode($request->listingsData, true);
    
            if (!is_array($listingsData)) {
                throw new \Exception('Invalid JSON format');
            }
    
            DB::transaction(function () use ($listingsData) {
                foreach ($listingsData as $key => $listingData) {
                    $validator = Validator::make($listingData, [
                        'name' => 'required|string',
                        'description' => 'nullable|string|max:1000',
                        'author' => 'nullable|string|max:255',
                        'type' => 'required|string',
                        'imageUrl' => 'nullable|url|max:255',
                        'link' => 'nullable|url|max:255',
                        'tags' => 'required|string',
                    ]);
    
                    if ($validator->fails()) {
                        throw new \Exception("Validation failed for listing at index {$key}: " . json_encode($validator->errors()->all()));
                    }
    
                    $validated = $validator->validated();
    
                    // Validate type exists
                    $type = Type::where('name', $validated['type'])->first();
                    if (!$type) {
                        throw new \Exception("Type '{$validated['type']}' does not exist for listing at index {$key}.");
                    }
    
                    $tagNames = array_map('trim', explode(',', $validated['tags']));
                    
                    // Validate all tags exist
                    $existingTags = Tag::whereIn('name', $tagNames)->pluck('name')->toArray();
                    $missingTags = array_diff($tagNames, $existingTags);
                    
                    if (!empty($missingTags)) {
                        throw new \Exception("The following tags do not exist for listing at index {$key}: " . implode(', ', $missingTags));
                    }
    
                    unset($validated['tags']);
                    unset($validated['type']);
    
                    $listing = Listing::create([
                        ...$validated,
                        'type_id' => $type->id,
                        "user_id" => Auth::id()
                    ]);
    
                    // Attach existing tags
                    $tagIds = Tag::whereIn('name', $tagNames)->pluck('id')->toArray();
                    $listing->tags()->sync($tagIds);
                }
            });
    
            return redirect()->route('listings.index')
                             ->with('success', 'Listings created successfully!');
    
        } catch (\Exception $e) {
            return redirect()->back()
                             ->withErrors(['listingsData' => $e->getMessage()])
                             ->withInput();
        }
    }

    public function exportListings()
    {
        $listings = Listing::with(['tags', 'type'])
            ->where('user_id', Auth::id())
            ->latest()
            ->get()
            ->map(function ($listing) {
                return [
                    'id' => $listing->id,
                    'name' => $listing->name,
                    'description' => $listing->description,
                    'author' => $listing->author,
                    'imageUrl' => $listing->imageUrl,
                    'link' => $listing->link,
                    'type' => $listing->type->name,
                    'tags' => $listing->tags->pluck('name')->implode(', '),
                    'created_at' => $listing->created_at->toISOString(),
                    'updated_at' => $listing->updated_at->toISOString(),
                ];
            });

        return Inertia::render('Listings/export-listings', [
            'listings' => $listings->toArray()
        ]);
    }

    public function downloadListings(Request $request)
    {
        $request->validate([
            'fields' => 'nullable|array',
            'fields.*' => 'string|in:id,name,description,author,imageUrl,link,type,tags,created_at,updated_at'
        ]);

        $selectedFields = $request->input('fields', [
            'id', 'name', 'description', 'author', 'imageUrl', 'link', 'type', 'tags'
        ]);

        $listings = Listing::with(['tags', 'type'])
            ->where('user_id', Auth::id())
            ->latest()
            ->get()
            ->map(function ($listing) use ($selectedFields) {
                $data = [];
                
                if (in_array('id', $selectedFields)) {
                    $data['id'] = $listing->id;
                }
                if (in_array('name', $selectedFields)) {
                    $data['name'] = $listing->name;
                }
                if (in_array('description', $selectedFields)) {
                    $data['description'] = $listing->description;
                }
                if (in_array('author', $selectedFields)) {
                    $data['author'] = $listing->author;
                }
                if (in_array('imageUrl', $selectedFields)) {
                    $data['imageUrl'] = $listing->imageUrl;
                }
                if (in_array('link', $selectedFields)) {
                    $data['link'] = $listing->link;
                }
                if (in_array('type', $selectedFields)) {
                    $data['type'] = $listing->type->name;
                }
                if (in_array('tags', $selectedFields)) {
                    $data['tags'] = $listing->tags->pluck('name')->implode(', ');
                }
                if (in_array('created_at', $selectedFields)) {
                    $data['created_at'] = $listing->created_at->toISOString();
                }
                if (in_array('updated_at', $selectedFields)) {
                    $data['updated_at'] = $listing->updated_at->toISOString();
                }

                return $data;
            });

        $filename = 'listings-export-' . now()->format('Y-m-d-H-i-s') . '.json';
        $jsonData = json_encode($listings->toArray(), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        
        return response($jsonData, 200, [
            'Content-Type' => 'application/json',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Content-Length' => strlen($jsonData),
        ]);
    }
}
